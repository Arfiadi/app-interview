// Endpoint: /api/history/delete?id=...
export default async function handler(req, res) {
  // 1. Validasi Method
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // 2. Ambil ID dari Query
  const { id } = req.query;
  if (!id) return res.status(400).json({ message: 'Missing session ID' });

  try {
    // 3. Teruskan request ke Backend Python
    const backendUrl = `${process.env.PYTHON_API_URL}/history/delete/${id}`;
    
    const pythonResponse = await fetch(backendUrl, {
      method: 'DELETE',
    });

    // Jika backend gagal, teruskan status aslinya
    if (!pythonResponse.ok) {
        const errorData = await pythonResponse.json().catch(() => ({ detail: "Unknown error from backend" }));
        return res.status(pythonResponse.status).json({ message: errorData.detail || "Failed to delete" });
    }

    // 4. Sukses
    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error("Delete Proxy Error:", error);
    res.status(500).json({ message: "Failed to connect to backend service" });
  }
}