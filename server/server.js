const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const CONFIG_PATH = path.join(ROOT, "config.json");

const AUDIO_EXT = new Set([".mp3", ".mp4", ".wav", ".ogg", ".m4a"]);
const MIME = {
  ".mp3": "audio/mpeg",
  ".mp4": "audio/mp4",
  ".wav": "audio/wav",
  ".ogg": "audio/ogg",
  ".m4a": "audio/mp4",
  ".json": "application/json",
};

function loadConfig() {
  try {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
  } catch {
    return { port: 9090, corsOrigins: ["https://app.photonow.com.br"] };
  }
}

function listAudioFiles(folderName) {
  const dir = path.join(ROOT, folderName);
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((file) => AUDIO_EXT.has(path.extname(file).toLowerCase()))
    .sort()
    .map((file) => `${folderName}/${file}`);
}

function buildManifest() {
  const saudacoes = listAudioFiles("saudacoes");
  const despedidas = listAudioFiles("despedidas");
  const musicas = listAudioFiles("musica");

  return {
    saudacoes,
    despedidas,
    musica: musicas[0] || null,
  };
}

function setCors(res, origin, allowedOrigins) {
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else if (!origin) {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Vary", "Origin");
}

function sendJson(res, status, payload, origin, allowedOrigins) {
  setCors(res, origin, allowedOrigins);
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function sendFile(res, filePath, origin, allowedOrigins) {
  const ext = path.extname(filePath).toLowerCase();
  const mime = MIME[ext] || "application/octet-stream";

  fs.readFile(filePath, (err, data) => {
    setCors(res, origin, allowedOrigins);
    if (err) {
      res.writeHead(404);
      res.end("Arquivo nao encontrado");
      return;
    }
    res.writeHead(200, { "Content-Type": mime });
    res.end(data);
  });
}

const config = loadConfig();
const PORT = config.port || 9090;
const allowedOrigins = config.corsOrigins || [];

const server = http.createServer((req, res) => {
  const origin = req.headers.origin;
  const url = new URL(req.url, `http://127.0.0.1:${PORT}`);

  if (req.method === "OPTIONS") {
    setCors(res, origin, allowedOrigins);
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method !== "GET") {
    sendJson(res, 405, { error: "Metodo nao permitido" }, origin, allowedOrigins);
    return;
  }

  if (url.pathname === "/health") {
    sendJson(res, 200, { ok: true }, origin, allowedOrigins);
    return;
  }

  if (url.pathname === "/" || url.pathname === "/manifest.json") {
    const manifest = buildManifest();
    const payload =
      url.pathname === "/manifest.json"
        ? manifest
        : {
            ok: true,
            message: "PhotoNow audio server ativo",
            pasta: ROOT,
            urls: {
              manifest: `http://127.0.0.1:${PORT}/manifest.json`,
              health: `http://127.0.0.1:${PORT}/health`,
            },
            manifest,
            aviso:
              manifest.saudacoes.length === 0 ||
              manifest.despedidas.length === 0 ||
              !manifest.musica
                ? "Faltam arquivos em saudacoes/, despedidas/ ou musica/"
                : null,
          };
    sendJson(res, 200, payload, origin, allowedOrigins);
    return;
  }

  const relativePath = decodeURIComponent(url.pathname.replace(/^\/+/, ""));
  const safePath = path.normalize(relativePath).replace(/^(\.\.(\/|\\|$))+/, "");
  const absolutePath = path.join(ROOT, safePath);

  if (!absolutePath.startsWith(ROOT)) {
    sendJson(res, 403, { error: "Acesso negado" }, origin, allowedOrigins);
    return;
  }

  sendFile(res, absolutePath, origin, allowedOrigins);
});

server.listen(PORT, "127.0.0.1", () => {
  // eslint-disable-next-line no-console
  console.log(`PhotoNow audio server em http://127.0.0.1:${PORT}`);
  // eslint-disable-next-line no-console
  console.log(`Pasta de audios: ${ROOT}`);
});
