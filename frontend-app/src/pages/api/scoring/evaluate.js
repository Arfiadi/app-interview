// Endpoint: /api/scoring/evaluate
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  try {
    const pythonResponse = await fetch(`${process.env.PYTHON_API_URL}/scoring/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });

    const data = await pythonResponse.json();
    
    if (!pythonResponse.ok) throw new Error('Evaluation failed');

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}