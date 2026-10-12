import { Elysia, t, status } from "elysia";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

export const usersRoute = new Elysia({ prefix: "/users" })
  // GET /users - list semua users
  .get("/", async () => {
    const result = await db.select().from(users);
    return { data: result };
  })
  // GET /users/:id - ambil user berdasarkan id
  .get(
    "/:id",
    async ({ params }) => {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.id, params.id))
        .limit(1);
      if (!result[0]) return status(404, { message: "User not found" });
      return { data: result[0] };
    },
    { params: t.Object({ id: t.Numeric() }) }
  )
  // POST /users - buat user baru
  .post(
    "/",
    async ({ body }) => {
      try {
        await db.insert(users).values(body);
        const result = await db
          .select()
          .from(users)
          .where(eq(users.email, body.email))
          .limit(1);
        return status(201, { data: result[0] });
      } catch (err: any) {
        if (err?.code === "ER_DUP_ENTRY") {
          return status(409, { message: "Email already exists" });
        }
        throw err;
      }
    },
    {
      body: t.Object({
        name: t.String({ minLength: 1 }),
        email: t.String({ format: "email" }),
      }),
    }
  )
  // DELETE /users/:id - hapus user
  .delete(
    "/:id",
    async ({ params }) => {
      const existing = await db
        .select()
        .from(users)
        .where(eq(users.id, params.id))
        .limit(1);
      if (!existing[0]) return status(404, { message: "User not found" });

      await db.delete(users).where(eq(users.id, params.id));
      return { message: "User deleted" };
    },
    { params: t.Object({ id: t.Numeric() }) }
  );
