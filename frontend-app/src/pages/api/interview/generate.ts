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

    const pythonResponse = await fetch(`${process.env.PYTHON_API_URL}/interview/generate`, {
      method: 'POST',
      headers,
      body: JSON.stringify(req.body),
    });

    const contentType = pythonResponse.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
        const text = await pythonResponse.text();
        console.error("Python Non-JSON Error:", text);
        throw new Error(`Backend Error (Non-JSON): ${text.slice(0, 100)}...`);
    }

    const data = await pythonResponse.json();

    if (!pythonResponse.ok) {
      throw new Error(data.detail || 'Gagal generate pertanyaan dari AI');
    }

    res.status(200).json(data);
  } catch (error: any) {
    console.error('API Route Error:', error.message);
    res.status(500).json({ message: error.message });
  }
}