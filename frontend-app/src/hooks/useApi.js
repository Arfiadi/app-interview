import { useState } from "react";

// Tidak perlu BASE_URL hardcode lagi karena kita panggil API relative path
export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function request(url, method = "GET", body = null) {
    setLoading(true);
    setError(null);
    try {
      // url input contoh: "/history/all" -> jadi "/api/history/all"
      const endpoint = `/api${url}`; 
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: body ? JSON.stringify(body) : null,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.detail || "Request failed");
      }
      return data;
    } catch (err) {
      setError(err.message);
      console.error("[API ERROR]", err);
      throw err; // Re-throw agar komponen tahu errornya
    } finally {
      setLoading(false);
    }
  }

  // Wrappers
  async function saveHistory(session_id) {
    // Implementasi save history biasanya otomatis di backend saat evaluate
    // Tapi jika butuh manual trigger:
    return request("/history/save", "POST", { session_id });
  }

  async function getHistory(session_id) {
      if(session_id) return request(`/history/${session_id}`, "GET");
      return request("/history/all", "GET");
  }

  return {
    loading,
    error,
    request,
    saveHistory,
    getHistory
  };
}