const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const envFile = path.join(__dirname, ".env");
if (fs.existsSync(envFile)) {
  fs.readFileSync(envFile, "utf-8").split(/\r?\n/).forEach((line) => {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/i);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
  });
}

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const defaultOrigins = ["http://localhost:8000", "http://127.0.0.1:8000"];
const configuredOrigins = (process.env.FRONTEND_ORIGINS || process.env.APIFRONTEND_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = new Set([...defaultOrigins, ...configuredOrigins]);

app.use(cors({
  origin(origin, callback) {
    // Permite health checks, curl y tráfico configurado explícitamente.
    if (!origin || allowedOrigins.has(origin)) return callback(null, true);
    return callback(new Error(`Origen no permitido por CORS: ${origin}`));
  },
  methods: ["GET"],
}));
app.use(express.json());
app.use("/img", express.static(path.join(__dirname, "img")));

const loadFile = (relativePath) => fs.readFileSync(path.join(__dirname, relativePath), "utf-8");
let servicesData = [];
let projectsData = [];
let experienceMarkdown = "";

try {
  servicesData = JSON.parse(loadFile("data/services.json"));
  projectsData = JSON.parse(loadFile("data/projects.json"));
  experienceMarkdown = loadFile("data/experience.md");
} catch (error) {
  console.error("Error al cargar los datos al iniciar el servidor:", error);
  process.exit(1);
}

const setCache = (res) => res.set("Cache-Control", "public, max-age=60, stale-while-revalidate=30");
app.get("/health", (req, res) => res.json({ status: "ok" }));
app.get("/api/services", (req, res) => { setCache(res); res.json(servicesData); });
app.get("/api/projects", (req, res) => { setCache(res); res.json(projectsData); });
app.get("/api/experience", (req, res) => { setCache(res); res.type("text/markdown").send(experienceMarkdown); });

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`API local disponible en http://localhost:${PORT}`);
  console.log("Para el VPS, accede mediante el dominio configurado en tu proxy inverso.");
});

server.on("error", (error) => {
  console.error("No se pudo iniciar la API:", error.message);
  process.exit(1);
});
server.on("close", () => console.log("API detenida."));
