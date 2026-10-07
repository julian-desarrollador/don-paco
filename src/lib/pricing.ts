/**
 * Tarjeta de crédito: precio base + 10%.
 * Efectivo / transferencia: usa la base cuando no hay monto aparte en `cash`.
 */
export function precioTarjetaDesdeLista(precioBaseLista: number) {
  return Math.round(precioBaseLista * 1.1);
}

/** Inverso de `precioTarjetaDesdeLista`: el monto con tarjeta que ve el cliente → base guardada en BD (`lista`). */
export function listaDesdePrecioTarjeta(precioTarjeta: number) {
  if (!Number.isFinite(precioTarjeta) || precioTarjeta < 0) return 0;
  const target = Math.round(precioTarjeta);
  if (target === 0) return 0;
  const rough = Math.max(0, Math.round(target / 1.1));
  for (let delta = 0; delta <= 2; delta++) {
    const candidates = delta === 0 ? [rough] : [rough - delta, rough + delta];
    for (const candidate of candidates) {
      if (candidate >= 0 && Math.round(candidate * 1.1) === target) return candidate;
    }
  }
  return rough;
}

export function precioEfectivoTransfer(precioLista: number, efectivoTransfer: number | null) {
  if (efectivoTransfer === null || Number.isNaN(efectivoTransfer)) {
    return precioLista;
  }
  return efectivoTransfer;
}
