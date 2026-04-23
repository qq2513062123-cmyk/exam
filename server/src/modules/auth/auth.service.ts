import bcrypt from "bcryptjs";

import { query } from "../../config/db";
import { AppError } from "../../utils/errors";
import { signToken } from "../../utils/jwt";
import { LoginInput, Profile, PublicUser } from "./auth.types";

function toPublicUser(profile: Profile): PublicUser {
  return {
    id: profile.id,
    email: profile.email,
    role: profile.role,
    name: profile.name
  };
}

export async function login(input: LoginInput): Promise<{
  token: string;
  user: PublicUser;
}> {
  const result = await query<Profile>(
    `
      SELECT id, email, password_hash, role, name
      FROM profiles
      WHERE email = $1
      LIMIT 1
    `,
    [input.email]
  );

  const profile = result.rows[0];

  if (!profile) {
    throw new AppError("Invalid email or password", 401);
  }

  const passwordValid = await bcrypt.compare(input.password, profile.password_hash);

  if (!passwordValid) {
    throw new AppError("Invalid email or password", 401);
  }

  const user = toPublicUser(profile);
  const token = signToken({
    userId: user.id,
    role: user.role
  });

  return {
    token,
    user
  };
}

export async function getCurrentUser(userId: string): Promise<PublicUser> {
  const result = await query<Profile>(
    `
      SELECT id, email, password_hash, role, name
      FROM profiles
      WHERE id = $1
      LIMIT 1
    `,
    [userId]
  );

  const profile = result.rows[0];

  if (!profile) {
    throw new AppError("Unauthorized", 401);
  }

  return toPublicUser(profile);
}
