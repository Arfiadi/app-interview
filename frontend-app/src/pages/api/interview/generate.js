export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const pythonResponse = await fetch(`${process.env.PYTHON_API_URL}/interview/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    // Cek jika response bukan JSON (misal HTML error 500 dari uvicorn)
    const contentType = pythonResponse.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
        const text = await pythonResponse.text();
        console.error("Python Non-JSON Error:", text);
        throw new Error(`Backend Error (Non-JSON): ${text.slice(0, 100)}...`);
    }

    const data = await pythonResponse.json();

    if (!pythonResponse.ok) {
      // Tampilkan pesan detail dari Python (data.detail)
      throw new Error(data.detail || 'Gagal generate pertanyaan dari AI');
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('API Route Error:', error.message);
    res.status(500).json({ message: error.message });
  }
}