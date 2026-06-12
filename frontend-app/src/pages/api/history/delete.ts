import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query;
  if (!id) return res.status(400).json({ message: 'Missing session ID' });

  try {
    const backendUrl = `${process.env.PYTHON_API_URL}/history/delete/${id}`;
    
    const headers: Record<string, string> = {};
    if (req.headers.authorization) {
      headers['Authorization'] = req.headers.authorization;
    }

    const pythonResponse = await fetch(backendUrl, {
      method: 'DELETE',
      headers
    });

    if (!pythonResponse.ok) {
        const errorData = await pythonResponse.json().catch(() => ({ detail: "Unknown error from backend" }));
        return res.status(pythonResponse.status).json({ message: errorData.detail || "Failed to delete" });
    }

    res.status(200).json({ status: 'ok' });
  } catch (error: any) {
    console.error("Delete Proxy Error:", error);
    res.status(500).json({ message: "Failed to connect to backend service" });
  }
}