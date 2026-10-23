import Fastify from "fastify";
import cors from "@fastify/cors";
import { widgetRoutes } from "./routes/widget.js";

const app = Fastify({
  logger: {
    level: process.env.NODE_ENV === "production" ? "info" : "debug",
  },
});

await app.register(cors, {
  origin: true,
});

// Health check para containers e orquestradores
app.get("/health", async () => ({ status: "ok", timestamp: Date.now() }));

// Registra as rotas
await app.register(widgetRoutes);

const PORT = Number(process.env.PORT) || 4000;
const HOST = "0.0.0.0";

try {
  await app.listen({ port: PORT, host: HOST });
  app.log.info(`Servidor rodando em http://${HOST}:${PORT}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
