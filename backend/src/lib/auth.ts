import { NextFunction, Request, Response } from "express";
import { supabase } from "../queues/socialQueue";

const getBearerToken = (authorizationHeader?: string) => {
  if (!authorizationHeader) return null;
  const [scheme, token] = authorizationHeader.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  return token;
};

export const requireSupabaseAuth = async (req: Request, res: Response, next: NextFunction) => {
  const token = getBearerToken(req.headers.authorization);
  if (!token) {
    return res.status(401).json({ error: "Missing Bearer token" });
  }

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    return res.status(401).json({ error: "Invalid token" });
  }

  res.locals.authUserId = data.user.id;
  next();
};
