import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });

  try {
    const headers: Record<string, string> = {};
    if (req.headers.authorization) {
      headers['Authorization'] = req.headers.authorization;
    }
    const pythonResponse = await fetch(`${process.env.PYTHON_API_URL}/analytics/summary`, {
      headers
    });
    const data = await pythonResponse.json();
    res.status(pythonResponse.status).json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}
