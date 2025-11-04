import { Request,Response } from "express";
import { produceCreateIncidentEvent } from "../kafka/producer";

export const ingestLogs = async (req:Request, res:Response) => {
    const {logs} = req.body;
    try {
        await produceCreateIncidentEvent(logs);
        res.status(200).json({message: "Logs ingested successfully"});
    } catch (error) {
        console.error("Error ingesting logs:", error);
        res.status(500).json({message: "Error ingesting logs"});
    }
}