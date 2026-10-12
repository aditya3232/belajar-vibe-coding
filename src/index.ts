import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { pingDb } from "./db";
import { authRoute } from "./routes/auth";
import { usersRoute } from "./routes/users";
import { successResponse, errorResponse } from "./utils/response";

const PORT = Number(process.env.PORT ?? 3000);

const app = new Elysia()
  .use(
    swagger({
      path: "/swagger",
      documentation: {
        info: {
          title: "Belajar Vibe Coding API",
          version: "1.0.0",
          description:
            "REST API modern menggunakan Bun, ElysiaJS, Drizzle ORM, MySQL, dan autentikasi JWT.",
        },
        tags: [
          { name: "General", description: "Endpoint status server dan database" },
          { name: "Auth", description: "Endpoint autentikasi (Register, Login, Logout)" },
          { name: "Users", description: "Endpoint manajemen data pengguna (Terproteksi JWT)" },
        ],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: "http",
              scheme: "bearer",
              bearerFormat: "JWT",
              description:
                "Gunakan token JWT yang didapat dari /auth/login atau /auth/register",
            },
          },
        },
      },
    })
  )
  .onError(({ code, error, status }) => {
    if (code === "VALIDATION") {
      let details: any = error.message;
      try {
        details = JSON.parse(error.message);
      } catch {}
      return status(400, errorResponse("Validation error", details));
    }
    if (code === "NOT_FOUND") {
      return status(404, errorResponse("Endpoint not found"));
    }
    const message = (error as any)?.message ?? "Internal server error";
    return status(500, errorResponse(message));
  })
  // Health check
  .get(
    "/",
    () => successResponse("Belajar Vibe Coding API is running 🚀"),
    {
      detail: {
        tags: ["General"],
        summary: "Root health check",
      },
    }
  )
  .get(
    "/health",
    async () => {
      const dbOk = await pingDb();
      return successResponse("System health status", {
        status: dbOk ? "ok" : "degraded",
        database: dbOk ? "connected" : "unreachable",
        timestamp: new Date().toISOString(),
      });
    },
    {
      detail: {
        tags: ["General"],
        summary: "Database connection health check",
      },
    }
  )
  // Routes
  .use(authRoute)
  .use(usersRoute)
  .listen(PORT);

console.log(`🦊 Elysia server running at http://localhost:${PORT}`);
console.log(`📚 Swagger documentation available at http://localhost:${PORT}/swagger`);

export type App = typeof app;
