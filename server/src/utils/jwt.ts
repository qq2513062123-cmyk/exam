import jwt, { SignOptions } from "jsonwebtoken";

import { env } from "../config/env";

export type JwtPayload = {
  userId: string;
  role: "student" | "admin";
};

const expiresIn: SignOptions["expiresIn"] = "7d";

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}
