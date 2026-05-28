"use client";

import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { useUiStore } from "../store/uiStore";
import { SOCKET_URL } from "../utils/constants";

interface WebSocketOptions {
  subscriptions: string[];
  onIncidentCreated?: (data: unknown) => void;
  onIncidentAnalyzed?: (data: unknown) => void;
  onAlertCreated?: (data: unknown) => void;
  onPolicyViolation?: (data: unknown) => void;
}

export function useWebSocket(options: WebSocketOptions) {
  const socketRef = useRef<Socket | null>(null);
  const qc = useQueryClient();
  const incrementAlertCount = useUiStore((s) => s.incrementAlertCount);

  const handleIncidentCreated = useCallback(
    (data: unknown) => {
      qc.invalidateQueries({ queryKey: ["incidents"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
      options.onIncidentCreated?.(data);
    },
    [qc, options]
  );

  const handleIncidentAnalyzed = useCallback(
    (data: unknown) => {
      const payload = data as { incidentId?: string };
      if (payload.incidentId) {
        qc.invalidateQueries({ queryKey: ["incidents", payload.incidentId] });
      }
      options.onIncidentAnalyzed?.(data);
    },
    [qc, options]
  );

  const handleAlertCreated = useCallback(
    (data: unknown) => {
      qc.invalidateQueries({ queryKey: ["alerts"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
      incrementAlertCount();
      options.onAlertCreated?.(data);
    },
    [qc, incrementAlertCount, options]
  );

  const handlePolicyViolation = useCallback(
    (data: unknown) => {
      options.onPolicyViolation?.(data);
    },
    [options]
  );

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      options.subscriptions.forEach((room) => {
        socket.emit(`subscribe:${room}`);
      });
    });

    socket.on("incident:created", handleIncidentCreated);
    socket.on("incident:analyzed", handleIncidentAnalyzed);
    socket.on("alert:created", handleAlertCreated);
    socket.on("policy:violation", handlePolicyViolation);

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { socket: socketRef.current };
}
