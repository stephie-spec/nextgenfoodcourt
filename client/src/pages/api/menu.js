
export default async function handler(req, res) {
  try {
    const backendRes = await fetch('http://localhost:5555/api/menu');

    const text = await backendRes.text();

    if (!backendRes.ok) {
      return res.status(backendRes.status).send(text);
    }

    res.status(200).json(JSON.parse(text));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Proxy error' });
  }
}
