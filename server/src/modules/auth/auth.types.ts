export type Role = "student" | "admin";

export type Profile = {
  id: string;
  email: string;
  password_hash: string;
  role: Role;
  name: string | null;
};

export type PublicUser = {
  id: string;
  email: string;
  role: Role;
  name: string | null;
};

export type LoginInput = {
  email: string;
  password: string;
};
