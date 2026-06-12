import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const { username, password } = req.body;

  if (!process.env.PYTHON_API_URL) {
    return res.status(500).json({ message: "Konfigurasi Server Error: PYTHON_API_URL belum dikonfigurasi di dashboard Vercel." });
  }

  try {
    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);

    const pythonRes = await fetch(`${process.env.PYTHON_API_URL}/auth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData,
    });

    const data = await pythonRes.json();

    if (!pythonRes.ok) {
      return res.status(401).json({ message: "Login gagal. Periksa username/password." });
    }

    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
}