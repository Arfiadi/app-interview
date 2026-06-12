import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (req.headers.authorization) {
      headers['Authorization'] = req.headers.authorization;
    }

    const pythonResponse = await fetch(`${process.env.PYTHON_API_URL}/scoring/submit`, {
      method: 'POST',
      headers,
      body: JSON.stringify(req.body),
    });

    if (!pythonResponse.ok) throw new Error('Failed to submit answer');
    
    res.status(200).json({ status: 'ok' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}