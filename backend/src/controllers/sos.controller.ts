import { Request, Response } from "express";
import { createSOS } from "../services/sos.service";

export const sendSOS = async (
  req: Request,
  res: Response
) => {
  const sos = await createSOS(req.body);

  res.status(201).json(sos);
};