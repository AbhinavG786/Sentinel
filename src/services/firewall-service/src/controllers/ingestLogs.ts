import { Request,Response } from "express";
import { produceCreateIncidentEvent } from "../kafka/producer";

export const ingestLogs = async (req:Request, res:Response) => {
    const {logs} = req.body;
    if(!logs || !logs.source || !logs.severity || !logs.message){
        return res.status(400).json({message: "Invalid logs: source, severity, and message are required"});
    }
    try {
        await produceCreateIncidentEvent(logs);
        res.status(200).json({message: "Logs ingested successfully"});
    } catch (error) {
        console.error("Error ingesting logs:", error);
        res.status(500).json({message: "Error ingesting logs"});
    }
}