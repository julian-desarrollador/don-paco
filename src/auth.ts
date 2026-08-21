import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import type { NextAuthConfig } from "next-auth";

const DEV_SECRET_GLOBAL = "__donPacoAuthDevSecret";

/** Secreto dev sin `node:crypto` (compatible con Edge / middleware). */
function randomDevSecret(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function authSecret(): string | undefined {
  const raw = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  const s = typeof raw === "string" ? raw.trim() : "";
  if (s.length > 0) return s;

  if (process.env.NODE_ENV === "production") {
    return undefined;
  }

  // Solo desarrollo: Auth.js exige `secret`; si no está en .env, generamos uno en memoria
  const g = globalThis as unknown as Record<string, string | undefined>;
  if (!g[DEV_SECRET_GLOBAL]) {
    g[DEV_SECRET_GLOBAL] = randomDevSecret();
    console.warn(
      "[auth] No hay AUTH_SECRET ni NEXTAUTH_SECRET en el entorno. Usando un secreto temporal solo para desarrollo. " +
        "Agregá AUTH_SECRET a .env.local para sesiones estables y evitá este aviso.",
    );
  }
  return g[DEV_SECRET_GLOBAL];
}

function buildConfig(): NextAuthConfig {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@donpaco.com";
  const secret = authSecret();

  return {
    trustHost: true,
    secret,
    providers: [
      Credentials({
        name: "credentials",
        credentials: {
          password: { label: "Contraseña", type: "password" },
        },
        async authorize(credentials) {
          const password = credentials?.password?.toString() ?? "";
          if (!password) return null;
          const hash = process.env.ADMIN_PASSWORD_HASH?.trim();
          let ok = false;
          if (hash) {
            const { default: bcrypt } = await import("bcryptjs");
            ok = await bcrypt.compare(password, hash);
          } else {
            const plainEnv = process.env.ADMIN_PASSWORD;
            ok = !!plainEnv && plainEnv === password;
          }
          if (!ok) return null;
          return {
            id: "admin",
            email: adminEmail,
            name: "Administrador",
            role: "admin" as const,
          };
        },
      }),
    ],
    session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 30 },
    pages: {
      signIn: "/login",
    },
    callbacks: {
      async jwt({ token, user }) {
        if (user) {
          token.role = "admin";
          token.sub = user.id ?? "admin";
        }
        return token;
      },
      async session({ session, token }) {
        if (session.user) {
          session.user.id = (token.sub as string) ?? "admin";
          session.user.role = "admin";
        }
        return session;
      },
      authorized({ request, auth }) {
        const path = request.nextUrl.pathname;
        if (path.startsWith("/admin")) {
          return !!auth?.user;
        }
        if (path === "/login" && auth?.user) {
          return Response.redirect(new URL("/admin/dashboard", request.url));
        }
        return true;
      },
    },
  };
}

/** Inicialización perezosa: lee `AUTH_SECRET` en cada request (evita `secret` vacío en Edge/middleware). */
export const { handlers, auth, signIn, signOut } = NextAuth(buildConfig);
