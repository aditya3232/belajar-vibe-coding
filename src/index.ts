import { Elysia } from "elysia";
import { pingDb } from "./db";
import { usersRoute } from "./routes/users";

const PORT = Number(process.env.PORT ?? 3000);

const app = new Elysia()
  // Health check
  .get("/", () => ({
    status: "ok",
    message: "Belajar Vibe Coding API is running 🚀",
    timestamp: new Date().toISOString(),
  }))
  .get("/health", async () => {
    const dbOk = await pingDb();
    return {
      status: dbOk ? "ok" : "degraded",
      database: dbOk ? "connected" : "unreachable",
      timestamp: new Date().toISOString(),
    };
  })
  // Routes
  .use(usersRoute)
  .listen(PORT);

console.log(`🦊 Elysia server running at http://localhost:${PORT}`);

export type App = typeof app;
