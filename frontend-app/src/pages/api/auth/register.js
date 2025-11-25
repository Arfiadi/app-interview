export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  try {
    const pythonRes = await fetch(`${process.env.PYTHON_API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const data = await pythonRes.json();

    if (!pythonRes.ok) {
      return res.status(pythonRes.status).json(data);
    }

    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
}