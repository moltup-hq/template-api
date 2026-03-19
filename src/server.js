const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const items = new Map();
let nextId = 1;

app.get('/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

app.get('/api/items', (req, res) => res.json([...items.values()]));

app.get('/api/items/:id', (req, res) => {
  const item = items.get(parseInt(req.params.id));
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

app.post('/api/items', (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  const item = { id: nextId++, name, description: description || '', createdAt: new Date().toISOString() };
  items.set(item.id, item);
  res.status(201).json(item);
});

app.delete('/api/items/:id', (req, res) => {
  const id = parseInt(req.params.id);
  if (!items.has(id)) return res.status(404).json({ error: 'Not found' });
  items.delete(id);
  res.json({ ok: true });
});

if (require.main === module) {
  app.listen(PORT, () => console.log('Server running on port ' + PORT));
}
module.exports = app;
