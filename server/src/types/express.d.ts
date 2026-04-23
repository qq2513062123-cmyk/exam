declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: "student" | "admin";
      };
    }
  }
}

export {};
