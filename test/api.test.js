const http = require('http');
const app = require('../src/server');
const assert = require('assert');

let server;

function req(method, path, body) {
  return new Promise((resolve, reject) => {
    const opts = { hostname: 'localhost', port: server.address().port, path, method, headers: { 'Content-Type': 'application/json' } };
    const r = http.request(opts, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(data) }));
    });
    r.on('error', reject);
    if (body) r.write(JSON.stringify(body));
    r.end();
  });
}

(async () => {
  server = app.listen(0);
  
  let res = await req('GET', '/health');
  assert.strictEqual(res.status, 200);

  res = await req('POST', '/api/items', { name: 'Test Item', description: 'A test' });
  assert.strictEqual(res.status, 201);
  const id = res.data.id;

  res = await req('GET', '/api/items/' + id);
  assert.strictEqual(res.data.name, 'Test Item');

  res = await req('GET', '/api/items');
  assert(res.data.length >= 1);

  res = await req('DELETE', '/api/items/' + id);
  assert.strictEqual(res.data.ok, true);

  res = await req('GET', '/api/items/' + id);
  assert.strictEqual(res.status, 404);

  server.close();
  console.log('All API tests passed!');
})();
