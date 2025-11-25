import { useState } from "react";

const BASE_URL = "http://127.0.0.1:8000"; 
// Jika nanti deploy: gunakan process.env.NEXT_PUBLIC_API_URL

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Generic request wrapper
  async function request(url, method = "GET", body = null) {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BASE_URL}${url}`, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: body ? JSON.stringify(body) : null,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Request failed");
      }

      return data;
    } catch (err) {
      setError(err.message);
      console.error("[API ERROR]", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  // -------------------------
  // ✔ Generate Interview
  // -------------------------
  async function generateInterview(payload) {
    return request("/interview/generate", "POST", payload);
  }

  // -------------------------
  // ✔ Submit Answer
  // -------------------------
  async function submitAnswer(payload) {
    return request("/scoring/submit", "POST", payload);
  }

  // -------------------------
  // ✔ Evaluate Session
  // -------------------------
  async function evaluateSession(session_id) {
    return request("/scoring/evaluate", "POST", { session_id });
  }

  // -------------------------
  // ✔ Save to History
  // -------------------------
  async function saveHistory(session_id) {
    const res = await fetch(`${API_BASE}/history/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id }),
    });

    if (!res.ok) throw new Error("Failed to save history");

    return await res.json();
  }

  // -------------------------
  // ✔ Get History
  // -------------------------
  async function getHistory(session_id) {
    return request(`/history/${session_id}`, "GET");
  }

  // -------------------------
  // Return API hooks
  // -------------------------
  return {
    loading,
    error,
    generateInterview,
    submitAnswer,
    evaluateSession,
    saveHistory,
    getHistory,
  };
}
