import { Elysia, t, status } from "elysia";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { users } from "../db/schema";
import { jwtPlugin } from "../plugins/auth";
import { successResponse, errorResponse } from "../utils/response";

export const authRoute = new Elysia({ prefix: "/auth" })
  .use(jwtPlugin)
  // POST /auth/register
  .post(
    "/register",
    async ({ body, jwt }) => {
      // Periksa apakah email sudah digunakan
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, body.email))
        .limit(1);

      if (existingUser) {
        return status(409, errorResponse("Email already registered"));
      }

      // Hash password dengan bcrypt bawaan Bun
      const hashedPassword = await Bun.password.hash(body.password, {
        algorithm: "bcrypt",
        cost: 10,
      });

      // Simpan user ke database
      await db.insert(users).values({
        name: body.name,
        email: body.email,
        password: hashedPassword,
      });

      // Ambil data user yang baru dibuat tanpa kolom password
      const [newUser] = await db
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

      if (!newUser) {
        return status(500, errorResponse("Failed to create user"));
      }

      // Generate token JWT
      const token = await jwt.sign({
        id: newUser.id,
        email: newUser.email,
      });

      return status(
        201,
        successResponse("User registered successfully", {
          user: newUser,
          token,
        })
      );
    },
    {
      body: t.Object({
        name: t.String({ minLength: 2, description: "Nama lengkap user" }),
        email: t.String({ format: "email", description: "Email aktif user" }),
        password: t.String({ minLength: 6, description: "Password minimal 6 karakter" }),
      }),
      detail: {
        tags: ["Auth"],
        summary: "Register user baru",
        description: "Mendaftarkan user baru, mengenkripsi password dengan bcrypt, dan mengembalikan token JWT",
      },
    }
  )
  // POST /auth/login
  .post(
    "/login",
    async ({ body, jwt }) => {
      // Cari user berdasarkan email
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, body.email))
        .limit(1);

      if (!user) {
        return status(401, errorResponse("Invalid email or password"));
      }

      // Verifikasi password hash bcrypt
      const isPasswordValid = await Bun.password.verify(body.password, user.password);
      if (!isPasswordValid) {
        return status(401, errorResponse("Invalid email or password"));
      }

      // Generate token JWT
      const token = await jwt.sign({
        id: user.id,
        email: user.email,
      });

      return successResponse("Login successful", {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        token,
      });
    },
    {
      body: t.Object({
        email: t.String({ format: "email", description: "Email terdaftar" }),
        password: t.String({ minLength: 1, description: "Password user" }),
      }),
      detail: {
        tags: ["Auth"],
        summary: "Login user",
        description: "Autentikasi email dan password, mengembalikan token JWT",
      },
    }
  )
  // POST /auth/logout
  .post(
    "/logout",
    () => {
      return successResponse("Logout successful", null);
    },
    {
      detail: {
        tags: ["Auth"],
        summary: "Logout user",
        description: "Mengakhiri sesi autentikasi pengguna",
      },
    }
  );
