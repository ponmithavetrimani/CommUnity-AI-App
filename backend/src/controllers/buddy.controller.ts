import { Request, Response } from "express";
import {
  getBuddies,
  acceptBuddyRequest,
  getSession
} from "../services/buddy.service";

export const findBuddy = async (
  req: Request,
  res: Response
) => {
  const buddies = await getBuddies();

  res.json(buddies);
};

export const acceptBuddy = async (
  req: Request,
  res: Response
) => {
  const result = await acceptBuddyRequest();

  res.json(result);
};

export const getBuddySession = async (
  req: Request,
  res: Response
) => {
  const session = await getSession();

  res.json(session);
};