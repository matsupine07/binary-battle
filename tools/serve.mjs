// このフォルダを http://localhost:5605/ で見られるようにする（公開する前に、公開と同じ形で確かめるため）。
// tools/make-images.html が描いたアイコンと見出し画像を、img/ に保存する役もする。
//   node tools/serve.mjs [port=5605]
//   → http://localhost:5605/                      … ゲーム（screen.html）
//   → http://localhost:5605/tools/make-images.html … アイコンと見出し画像を描いて保存する
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.argv[2] || 5605);
const TYPES = {
  '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.mjs':'text/javascript; charset=utf-8',
  '.css':'text/css; charset=utf-8', '.json':'application/json; charset=utf-8', '.png':'image/png', '.svg':'image/svg+xml',
};
// この名前のほかは書かない（ページから、ほかの場所にファイルを置けないように）
const IMAGES = ['favicon-48.png', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png', 'ogp.png'];

http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (req.method === 'POST' && url.pathname === '/save-image') {
    const name = url.searchParams.get('name');
    if (!IMAGES.includes(name)) { res.writeHead(400); res.end('unknown name'); return; }
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => {
      const data = Buffer.concat(chunks);
      if (data.subarray(1, 4).toString() !== 'PNG') { res.writeHead(400); res.end('not a png'); return; }
      fs.mkdirSync(path.join(root, 'img'), {recursive:true});
      fs.writeFileSync(path.join(root, 'img', name), data);
      console.log(`保存した：img/${name}（${data.length} バイト）`);
      res.writeHead(200); res.end('ok');
    });
    return;
  }
  let p = decodeURIComponent(url.pathname);
  if (p === '/') p = '/screen.html';   // 本番も / は screen.html へ送っている（firebase.json）
  const file = path.join(root, p);
  if (!file.startsWith(root + path.sep)) { res.writeHead(404); res.end('not found'); return; }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); res.end('not found'); return; }
    res.writeHead(200, {'Content-Type':TYPES[path.extname(file)] || 'application/octet-stream', 'Cache-Control':'no-cache'});
    res.end(data);
  });
}).listen(port, () => console.log(`http://localhost:${port}/ で開けます（止めるときは Ctrl+C）`));
