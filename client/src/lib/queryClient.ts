import { QueryClient, QueryFunction } from "@tanstack/react-query";

// API isteği için temel URL
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let errorMessage;
    try {
      const errorData = await res.json();
      errorMessage = errorData.message || res.statusText;
    } catch {
      errorMessage = await res.text() || res.statusText;
    }
    throw new Error(`${res.status}: ${errorMessage}`);
  }
}

// QueryClient örneği oluştur
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 dakika
    },
  },
});

// API isteği gönderme fonksiyonu
export async function apiRequest(
  method: string,
  endpoint: string,
  data?: unknown,
  customHeaders?: Record<string, string>
) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    ...customHeaders,
  };

  const config: RequestInit = {
    method,
    headers,
    credentials: "include",
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, config);
    await throwIfResNotOk(response);
    return response;
  } catch (error) {
    console.error("API isteği başarısız:", error);
    throw error;
  }
}

// Kimlik doğrulama fonksiyonları
export async function login(username: string, password: string) {
  const response = await apiRequest("POST", "/api/auth/login", { username, password });
  const user = await response.json();
  return user;
}

export async function register(userData: {
  username: string;
  password: string;
  name: string;
  email: string;
  phone?: string;
  position?: string;
}) {
  const response = await apiRequest("POST", "/api/users", userData);
  const user = await response.json();
  return user;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey[0] as string;
    const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
    
    const res = await fetch(fullUrl, {
      credentials: "include",
      headers: {
        "Accept": "application/json"
      }
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };
