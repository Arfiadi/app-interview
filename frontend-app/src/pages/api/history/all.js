export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });

  try {
    const pythonResponse = await fetch(`${process.env.PYTHON_API_URL}/history/all`);
    const data = await pythonResponse.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}