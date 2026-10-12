import { Elysia, status } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { errorResponse } from "../utils/response";

export interface JwtPayload {
  id: number;
  email: string;
}

export const jwtPlugin = new Elysia({ name: "jwtPlugin" }).use(
  jwt({
    name: "jwt",
    secret: process.env.JWT_SECRET || "supersecretjwtkey",
  })
);

export const authGuard = new Elysia({ name: "authGuard" })
  .use(jwtPlugin)
  .derive({ as: "scoped" }, async ({ jwt, headers }) => {
    const authHeader = headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { currentUser: null };
    }
    const token = authHeader.slice(7).trim();
    const payload = (await jwt.verify(token)) as
      | (JwtPayload & { exp?: number; iat?: number })
      | false;

    return { currentUser: payload || null };
  })
  .onBeforeHandle({ as: "scoped" }, ({ currentUser }) => {
    if (!currentUser) {
      return status(
        401,
        errorResponse("Unauthorized: Token tidak valid atau tidak disediakan")
      );
    }
  });
