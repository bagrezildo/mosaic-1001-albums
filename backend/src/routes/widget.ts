import type { FastifyPluginAsync } from "fastify";
import { fetchWidgetData } from "../services/generatorService.js";

export const widgetRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get<{ Params: { slug: string } }>(
    "/api/widget/:slug",
    async (request, reply) => {
      const { slug } = request.params;

      if (!slug) {
        return reply
          .code(400)
          .send({ error: "Slug do projeto é obrigatório." });
      }

      try {
        const data = await fetchWidgetData(slug);
        return reply.send(data);
      } catch (err: any) {
        if (err.message === "PROJECT_NOT_FOUND") {
          return reply
            .code(404)
            .send({ error: "Projeto não encontrado no 1001 Albums." });
        }
        return reply
          .code(502)
          .send({ error: "Falha ao consultar a API upstream." });
      }
    },
  );
};
