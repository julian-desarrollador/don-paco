"use client";

import { useState } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  return (
    <form
      className="mt-4 flex gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        if (!email.trim()) return;
        setDone(true);
      }}
    >
      <label htmlFor="footer-newsletter" className="sr-only">
        Email para novedades
      </label>
      <input
        id="footer-newsletter"
        type="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="Tu email"
        disabled={done}
        className="w-full rounded-full border border-white/15 bg-white/10 px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/50 focus:border-[#029f9c]"
      />
      <button
        type="submit"
        disabled={done}
        className="shrink-0 rounded-full bg-[#f97316] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#ea580c] disabled:opacity-80"
      >
        {done ? "Listo" : "Enviar"}
      </button>
    </form>
  );
}
