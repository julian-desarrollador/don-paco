"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { safeAdminRedirectAfterLogin } from "@/lib/auth-redirect";

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        password,
        redirect: false,
      });
      if (res?.error) {
        toast.error("Credenciales incorrectas");
        return;
      }
      toast.success("Bienvenida");
      const rawCallback = searchParams.get("callbackUrl");
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const next = safeAdminRedirectAfterLogin(rawCallback, origin || "http://localhost");
      router.push(next);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f4f4f5] px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-black text-[#029f9c]">Don Paco</CardTitle>
          <p className="text-center text-sm text-[#71717a]">Acceso al panel de administración</p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Entrando…" : "Entrar"}
            </Button>
          </form>
          <p className="mt-6 text-center text-xs text-[#a1a1aa]">
            <Link href="/" className="text-[#029f9c] hover:underline">
              Volver a la tienda
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
