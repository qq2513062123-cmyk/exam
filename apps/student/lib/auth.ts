export type StudentUser = {
  id: string;
  email: string;
  role: "student" | "admin";
  name: string | null;
};

type LoginResponse = {
  success: boolean;
  message: string;
  data?: {
    token: string;
    user: StudentUser;
  };
};

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api";

const TOKEN_KEY = "student_token";
const USER_KEY = "student_user";

export async function loginStudent(email: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });

  const result = (await response.json()) as LoginResponse;

  if (!response.ok || !result.success || !result.data) {
    throw new Error(result.message || "登录失败");
  }

  return result.data;
}

export function saveAuth(token: string, user: StudentUser): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): StudentUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  const value = localStorage.getItem(USER_KEY);

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as StudentUser;
  } catch {
    clearAuth();
    return null;
  }
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
