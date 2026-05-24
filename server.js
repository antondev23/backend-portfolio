const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3001;

// Permite que React (en otro puerto) consuma esta API
app.use(cors());
app.use(express.json());

// GET /api/services → lee el archivo y devuelve los datos
app.get("/api/services", (req, res) => {
  const filePath = path.join(__dirname, "data", "services.json");
  fs.readFile(filePath, "utf-8", (err, data) => {
    if (err) {
      return res.status(500).json({ error: "No se pudo leer los servicios" });
    }
    res.json(JSON.parse(data));
  });
});

app.get("/api/projects", (req, res) => {
  const filePath = path.join(__dirname, "data", "projects.json");
    fs.readFile(filePath, "utf-8", (err, data) => {
    if (err) {
      return res.status(500).json({ error: "No se pudo leer los proyectos" });
    }
    res.json(JSON.parse(data));
    });
});

app.get("/api/experience", (req, res) => {
  const filePath = path.join(__dirname, "data", "experience.md");
  fs.readFile(filePath, "utf-8", (err, data) => {
    if (err) {
      return res.status(500).json({ error: "No se pudo leer la experiencia" });
    }

    res.type("text/markdown").send(data);
  });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
