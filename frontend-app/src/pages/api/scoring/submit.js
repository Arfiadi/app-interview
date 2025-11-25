// Endpoint: /api/scoring/submit
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  try {
    const pythonResponse = await fetch(`${process.env.PYTHON_API_URL}/scoring/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });

    if (!pythonResponse.ok) throw new Error('Failed to submit answer');
    
    res.status(200).json({ status: 'ok' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}