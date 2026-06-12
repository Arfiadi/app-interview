import { useState } from "react";
import { useRouter } from "next/router";

export function useApi() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function request(url: string, method: string = "GET", body: any = null) {
    setLoading(true);
    setError(null);
    try {
      const endpoint = `/api${url}`; 
      
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (typeof window !== "undefined") {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            if (parsed.token) {
              headers["Authorization"] = `Bearer ${parsed.token}`;
            }
          } catch (e) {}
        }
      }

      const response = await fetch(endpoint, {
        method,
        headers,
        body: body ? JSON.stringify(body) : null,
      });

      // Auto-logout on 401: token expired or invalid
      if (response.status === 401) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("user");
        }
        router.replace("/login");
        throw new Error("Sesi Anda telah berakhir. Silakan login kembali.");
      }

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Request failed");
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function saveHistory(session_id: string) {
    return request("/history/save", "POST", { session_id });
  }

  async function getHistory(session_id?: string) {
      if(session_id) return request(`/history/${session_id}`, "GET");
      return request("/history/all", "GET");
  }

  async function deleteHistory(session_id: string) {
      return request(`/history/delete?id=${session_id}`, "DELETE");
  }

  async function getAnalyticsSummary() {
      return request("/analytics/summary", "GET");
  }

  async function getAnalyticsTrend(limit: number = 10) {
      return request(`/analytics/trend?limit=${limit}`, "GET");
  }

  return { 
      loading, 
      error, 
      request, 
      saveHistory, 
      getHistory, 
      deleteHistory,
      getAnalyticsSummary,
      getAnalyticsTrend
  };
}