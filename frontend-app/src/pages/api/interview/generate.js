// Endpoint: /api/interview/generate
export default async function handler(req, res) {
  // 1. Validasi Method
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // 2. Panggil Python Backend (Server-to-Server)
    const pythonResponse = await fetch(`${process.env.PYTHON_API_URL}/interview/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    const data = await pythonResponse.json();

    if (!pythonResponse.ok) {
      throw new Error(data.detail || 'Backend error');
    }

    // 3. Kembalikan hasil ke Frontend
    res.status(200).json(data);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ message: error.message });
  }
}