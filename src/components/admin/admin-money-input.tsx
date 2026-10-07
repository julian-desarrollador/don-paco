"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import { formatMilesAr, parseMilesAr } from "@/lib/product-format";
import { cn } from "@/lib/utils";

function formatMoney(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value) || value <= 0) return "";
  return formatMilesAr(value);
}

function caretAfterDigits(formatted: string, digitCount: number) {
  if (digitCount <= 0) return 0;
  let seen = 0;
  for (let i = 0; i < formatted.length; i++) {
    const ch = formatted[i]!;
    if (ch >= "0" && ch <= "9") seen++;
    if (seen === digitCount) return i + 1;
  }
  return formatted.length;
}

type Props = {
  id: string;
  value: number | null;
  onChange: (value: number | null) => void;
  onBlur?: () => void;
  className?: string;
};

export function AdminMoneyInput({ id, value, onChange, onBlur, className }: Props) {
  const ref = useRef<HTMLInputElement>(null);
  const focused = useRef(false);
  const pendingDigits = useRef<number | null>(null);
  const [text, setText] = useState(() => formatMoney(value));

  useEffect(() => {
    if (focused.current) return;
    setText(formatMoney(value));
  }, [value]);

  useLayoutEffect(() => {
    const el = ref.current;
    const digits = pendingDigits.current;
    if (!el || digits == null) return;
    const pos = caretAfterDigits(text, digits);
    el.setSelectionRange(pos, pos);
    pendingDigits.current = null;
  }, [text]);

  return (
    <Input
      ref={ref}
      id={id}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      className={cn(className)}
      value={text}
      onFocus={() => {
        focused.current = true;
      }}
      onBlur={() => {
        focused.current = false;
        setText(formatMoney(value));
        onBlur?.();
      }}
      onChange={(e) => {
        const raw = e.target.value;
        const caret = e.target.selectionStart ?? raw.length;
        pendingDigits.current = raw.slice(0, caret).replace(/\D/g, "").length;
        const parsed = parseMilesAr(raw);
        setText(parsed == null ? "" : formatMilesAr(parsed));
        onChange(parsed);
      }}
    />
  );
}
