import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import chatHandler from "./api/chat";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware para parsear JSON
  app.use(express.json());

  // Ruta de la API para el chat (compatible con la lógica de Vercel)
  app.post("/api/chat", async (req, res) => {
    try {
      await chatHandler(req as any, res as any);
    } catch (error) {
      console.error("Error en el handler de chat:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  // Configuración de Vite como middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor legal corriendo en http://localhost:${PORT}`);
  });
}

startServer();
