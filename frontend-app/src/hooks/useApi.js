import { useState } from "react";

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function request(url, method = "GET", body = null) {
    setLoading(true);
    setError(null);
    try {
      const endpoint = `/api${url}`; 
      
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : null,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Request failed");
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function saveHistory(session_id) {
    return request("/history/save", "POST", { session_id });
  }

  async function getHistory(session_id) {
      if(session_id) return request(`/history/${session_id}`, "GET");
      return request("/history/all", "GET");
  }

  // FUNGSI BARU: DELETE
  async function deleteHistory(session_id) {
      // Panggil endpoint Next.js dengan query param
      return request(`/history/delete?id=${session_id}`, "DELETE");
  }

  return { loading, error, request, saveHistory, getHistory, deleteHistory };
}