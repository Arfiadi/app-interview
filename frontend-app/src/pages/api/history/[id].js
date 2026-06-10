export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ message: 'Missing session ID' });
  }

  try {
    const pythonResponse = await fetch(`${process.env.PYTHON_API_URL}/history/${id}`);
    const data = await pythonResponse.json();

    if (!pythonResponse.ok) {
      return res.status(pythonResponse.status).json({ message: data.detail || 'Failed to fetch history' });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error("Fetch Single History Proxy Error:", error);
    res.status(500).json({ message: 'Failed to connect to backend service' });
  }
}
