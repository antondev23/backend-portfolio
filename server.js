const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const app = express();
const PORT = process.env.PORT || 3000;
const allowedOrigins = [
  process.env.APIFRONTEND_URL,
  "http://localhost:8000",
  "http://localhost:9000",
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error("Origen no permitido por CORS"));
  },
  methods: ["GET"],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use("/img", express.static(path.join(__dirname, "img")));

const loadFile = (relativePath) => {
  const filePath = path.join(__dirname, relativePath);
  return fs.readFileSync(filePath, "utf-8");
};

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

const setCache = (res) => {
  res.set("Cache-Control", "public, max-age=60, stale-while-revalidate=30");
};

app.get("/api/services", (req, res) => {
  setCache(res);
  res.json(servicesData);
});

app.get("/api/projects", (req, res) => {
  setCache(res);
  res.json(projectsData);
});

app.get("/api/experience", (req, res) => {
  setCache(res);
  res.type("text/markdown").send(experienceMarkdown);
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
