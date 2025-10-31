import incidentsService from "../services/incidents.service";
import { Request, Response } from "express";
import { Incident } from "../services/incidents.service";

class IncidentsController {
  createIncident = async (req: Request, res: Response) => {
    const {
      title,
      description,
      severity,
      reported_by,
      assigned_to,
      team_id,
      status,
    } = req.body;
    if (!title || !description || !severity) {
      return res
        .status(400)
        .json({ error: "Title, description, and severity are required" });
    }
    try {
      const newIncident = await incidentsService.createIncident({
        title,
        description,
        severity,
        reported_by,
        assigned_to,
        team_id,
        status,
      });
      return res.status(201).json(newIncident);
    } catch (error) {
      console.error("Error creating incident:", error);
      return res.status(500).json({ error: "Failed to create incident" });
    }
  };

  getAllIncidents = async (req: Request, res: Response) => {
    const { status, severity, reported_by, search, page, limit } = req.query;
    try {
      const result = await incidentsService.getFilteredIncidents({
        status: status as string,
        severity: severity as string,
        reported_by: reported_by as string,
        search: search as string,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 10,
      });
      return res.status(200).json(result);
    } catch (error) {
      console.error("Error fetching incidents:", error);
      return res.status(500).json({ error: "Failed to fetch incidents" });
    }
  };

  getIncidentById = async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Incident ID is required" });
    }
    try {
      const incident: Incident | null =
        await incidentsService.getIncidentById(id);
      if (!incident) {
        return res.status(404).json({ error: "Incident not found" });
      }
      return res.status(200).json(incident);
    } catch (error) {
      console.error("Error fetching incident:", error);
      return res.status(500).json({ error: "Failed to fetch incident" });
    }
  };

  updateIncident = async (req: Request, res: Response) => {
    const { id } = req.params;
    const updates: Partial<Incident> = req.body;
    if (!id) {
      return res.status(400).json({ error: "Incident ID is required" });
    }
    try {
      const updatedIncident = await incidentsService.updateIncident(
        id,
        updates
      );
      if (!updatedIncident) {
        return res.status(404).json({ error: "Incident not found" });
      }
      return res.status(200).json(updatedIncident);
    } catch (error) {
      console.error("Error updating incident:", error);
      return res.status(500).json({ error: "Failed to update incident" });
    }
  };

  deleteIncident = async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Incident ID is required" });
    }
    try {
      const deleted = await incidentsService.deleteIncident(id);
      if (!deleted) {
        return res.status(404).json({ error: "Incident not found" });
      }
      return res.status(204).send();
    } catch (error) {
      console.error("Error deleting incident:", error);
      return res.status(500).json({ error: "Failed to delete incident" });
    }
  };
}

export default new IncidentsController();
