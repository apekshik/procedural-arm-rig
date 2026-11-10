// Tiny local recorder for the showcase video: serves the page and saves the frames it posts.
//   node record-server.js      then open http://localhost:5187/ and run rig.direct() in the console
// Frames land in ./frames as f_00000.jpg, f_00001.jpg, ...
const http = require('http'), fs = require('fs'), path = require('path');
const dir = path.join(__dirname, 'frames');
fs.mkdirSync(dir, { recursive: true });
http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (req.method === 'POST' && url.pathname === '/frame') {
    const n = String(parseInt(url.searchParams.get('n'), 10) || 0).padStart(5, '0'), chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => { fs.writeFileSync(path.join(dir, `f_${n}.jpg`), Buffer.concat(chunks)); res.writeHead(200); res.end('ok'); });
    return;
  }
  if (req.method === 'POST' && url.pathname === '/clear') {
    for (const f of fs.readdirSync(dir)) if (/^f_\d+\.jpg$/.test(f)) fs.unlinkSync(path.join(dir, f));
    res.writeHead(200); res.end('ok'); return;
  }
  if (url.pathname === '/' || url.pathname === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(fs.readFileSync(path.join(__dirname, 'index.html'))); return;
  }
  res.writeHead(404); res.end('not found');
}).listen(5187, '127.0.0.1', () => console.log('recorder on http://localhost:5187'));
