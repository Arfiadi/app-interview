import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (req.headers.authorization) {
      headers['Authorization'] = req.headers.authorization;
    }

    const pythonResponse = await fetch(`${process.env.PYTHON_API_URL}/history/save`, {
      method: 'POST',
      headers,
      body: JSON.stringify(req.body),
    });

    const data = await pythonResponse.json();

    if (!pythonResponse.ok) {
      throw new Error(data.detail || 'Backend error');
    }

    res.status(200).json(data);
  } catch (error: any) {
    console.error('API Error:', error);
    res.status(500).json({ message: error.message });
  }
}