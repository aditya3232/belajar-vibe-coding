import { Elysia, t, status } from "elysia";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { users } from "../db/schema";
import { authGuard } from "../plugins/auth";
import { successResponse, errorResponse } from "../utils/response";

export const usersRoute = new Elysia({ prefix: "/users" })
  .use(authGuard)
  // GET /users - list semua users (password tidak diekspos)
  .get(
    "/",
    async () => {
      const result = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        })
        .from(users);

      return successResponse("Users retrieved successfully", result);
    },
    {
      detail: {
        tags: ["Users"],
        summary: "Ambil seluruh daftar user (Terproteksi)",
        description: "Mengembalikan daftar semua user tanpa kolom password. Membutuhkan Bearer Token.",
        security: [{ bearerAuth: [] }],
      },
    }
  )
  // GET /users/:id - ambil user berdasarkan id
  .get(
    "/:id",
    async ({ params }) => {
      const result = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        })
        .from(users)
        .where(eq(users.id, params.id))
        .limit(1);

      if (!result[0]) {
        return status(404, errorResponse("User not found"));
      }

      return successResponse("User retrieved successfully", result[0]);
    },
    {
      params: t.Object({ id: t.Numeric({ description: "User ID" }) }),
      detail: {
        tags: ["Users"],
        summary: "Ambil detail user by ID (Terproteksi)",
        description: "Mengembalikan detail data satu user berdasarkan ID. Membutuhkan Bearer Token.",
        security: [{ bearerAuth: [] }],
      },
    }
  )
  // POST /users - buat user baru secara administratif
  .post(
    "/",
    async ({ body }) => {
      try {
        const hashedPassword = await Bun.password.hash(body.password, {
          algorithm: "bcrypt",
          cost: 10,
        });

        await db.insert(users).values({
          name: body.name,
          email: body.email,
          password: hashedPassword,
        });

        const [createdUser] = await db
          .select({
            id: users.id,
            name: users.name,
            email: users.email,
            createdAt: users.createdAt,
            updatedAt: users.updatedAt,
          })
          .from(users)
          .where(eq(users.email, body.email))
          .limit(1);

        return status(
          201,
          successResponse("User created successfully", createdUser)
        );
      } catch (err: any) {
        if (err?.code === "ER_DUP_ENTRY") {
          return status(409, errorResponse("Email already exists"));
        }
        throw err;
      }
    },
    {
      body: t.Object({
        name: t.String({ minLength: 2, description: "Nama user" }),
        email: t.String({ format: "email", description: "Email user" }),
        password: t.String({ minLength: 6, description: "Password user" }),
      }),
      detail: {
        tags: ["Users"],
        summary: "Tambah user baru (Terproteksi)",
        description: "Membuat user baru secara administratif dengan password yang dienkripsi bcrypt. Membutuhkan Bearer Token.",
        security: [{ bearerAuth: [] }],
      },
    }
  )
  // DELETE /users/:id - hapus user
  .delete(
    "/:id",
    async ({ params }) => {
      const existing = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.id, params.id))
        .limit(1);

      if (!existing[0]) {
        return status(404, errorResponse("User not found"));
      }

      await db.delete(users).where(eq(users.id, params.id));
      return successResponse("User deleted successfully", null);
    },
    {
      params: t.Object({ id: t.Numeric({ description: "User ID" }) }),
      detail: {
        tags: ["Users"],
        summary: "Hapus user by ID (Terproteksi)",
        description: "Menghapus user berdasarkan ID. Membutuhkan Bearer Token.",
        security: [{ bearerAuth: [] }],
      },
    }
  );
