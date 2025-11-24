// Endpoint: /api/history/save
export default async function handler(req, res) {
  // 1. Validasi Method (Hanya menerima POST)
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // 2. Panggil Python Backend
    // Endpoint Python: /history/save
    const pythonResponse = await fetch(`${process.env.PYTHON_API_URL}/history/save`, {
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

    // 3. Kembalikan hasil sukses ke Frontend
    res.status(200).json(data);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ message: error.message });
  }
}