"use client";

import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/components/cart-provider";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import { formatArs } from "@/lib/products";

const DRAFT_KEY = "amc_checkout_draft_v1";

type CheckoutForm = {
  fullName: string;
  phone: string;
  email: string;
  street: string;
  addressNumber: string;
  apartment: string;
  city: string;
  province: string;
  postalCode: string;
  notes: string;
};

type FormErrors = Partial<Record<keyof CheckoutForm, string>>;
type TouchedFields = Partial<Record<keyof CheckoutForm, boolean>>;

const initialForm: CheckoutForm = {
  fullName: "",
  phone: "",
  email: "",
  street: "",
  addressNumber: "",
  apartment: "",
  city: "",
  province: "",
  postalCode: "",
  notes: "",
};

const requiredFields: Array<keyof CheckoutForm> = [
  "fullName",
  "phone",
  "email",
  "street",
  "addressNumber",
  "city",
  "province",
  "postalCode",
];

function isValidPhone(phone: string) {
  const trimmed = phone.trim();
  if (!trimmed) return false;
  if (!/^[\d\s-]+$/.test(trimmed)) return false;
  const digits = trimmed.replace(/\D/g, "");
  return digits.length >= 8 && digits.length <= 15;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function buildAddress(form: CheckoutForm) {
  const apartmentPart = form.apartment.trim() ? ` - ${form.apartment.trim()}` : "";
  return `${form.street.trim()} ${form.addressNumber.trim()}${apartmentPart} - ${form.city.trim()}, ${form.province.trim()} - CP ${form.postalCode.trim()}`;
}

function Label({
  children,
  required,
  htmlFor,
}: {
  children: string;
  required?: boolean;
  htmlFor: string;
}) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-stone-700">
      {children}
      {required ? <span className="ml-1 text-red-600">*</span> : null}
    </label>
  );
}

function getErrors(form: CheckoutForm): FormErrors {
  const errors: FormErrors = {};
  (Object.keys(form) as Array<keyof CheckoutForm>).forEach((field) => {
    const fieldError = getFieldError(field, form);
    if (fieldError) errors[field] = fieldError;
  });
  return errors;
}

function getFieldError(field: keyof CheckoutForm, form: CheckoutForm) {
  switch (field) {
    case "fullName":
      return form.fullName.trim() ? "" : "El nombre es obligatorio";
    case "phone":
      if (!form.phone.trim()) return "El teléfono es obligatorio";
      return isValidPhone(form.phone) ? "" : "Ingresá un número de teléfono válido";
    case "email":
      if (!form.email.trim() || !isValidEmail(form.email)) return "Ingresá un email válido";
      return "";
    case "street":
      return form.street.trim() ? "" : "La calle es obligatoria";
    case "addressNumber":
      return form.addressNumber.trim() ? "" : "El número es obligatorio";
    case "city":
      return form.city.trim() ? "" : "La localidad es obligatoria";
    case "province":
      return form.province.trim() ? "" : "La provincia es obligatoria";
    case "postalCode":
      return form.postalCode.trim() ? "" : "El código postal es obligatorio";
    default:
      return "";
  }
}

export default function CheckoutPage() {
  const { items, subtotal, removeItem } = useCart();
  const [form, setForm] = useState<CheckoutForm>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<TouchedFields>({});
  const [apiError, setApiError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const itemsPayload = useMemo(
    () => items.map((item) => ({ id: item.slug, quantity: item.quantity })),
    [items],
  );

  const shippingLabel = "A coordinar";
  const total = subtotal;
  const isFormValid = Object.keys(getErrors(form)).length === 0;
  const canPay = isFormValid && itemsPayload.length > 0 && !isSubmitting;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    try {
      const savedRaw = sessionStorage.getItem(DRAFT_KEY);
      if (!savedRaw) return;
      const saved = JSON.parse(savedRaw) as Partial<CheckoutForm>;
      setForm((previous) => ({ ...previous, ...saved }));
    } catch {
      // Ignore invalid persisted data.
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(form));
  }, [form]);

  const handleChange =
    (field: keyof CheckoutForm) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value;
      setForm((previous) => {
        const nextForm = { ...previous, [field]: value };
        if (touched[field]) {
          const fieldError = getFieldError(field, nextForm);
          setErrors((previousErrors) => ({ ...previousErrors, [field]: fieldError }));
        }
        return nextForm;
      });
      if (apiError) setApiError("");
    };

  const handleBlur = (field: keyof CheckoutForm) => () => {
    setTouched((previous) => ({ ...previous, [field]: true }));
    setErrors((previous) => ({ ...previous, [field]: getFieldError(field, form) }));
  };

  const clearCart = () => {
    items.forEach((item) => removeItem(item.slug));
  };

  const handlePay = async () => {
    const nextErrors = getErrors(form);
    setTouched((previous) => {
      const nextTouched = { ...previous };
      requiredFields.forEach((field) => {
        nextTouched[field] = true;
      });
      return nextTouched;
    });
    setErrors(nextErrors);
    setApiError("");

    if (Object.keys(nextErrors).length > 0 || itemsPayload.length === 0) return;

    const customer = {
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      street: form.street.trim(),
      addressNumber: form.addressNumber.trim(),
      apartment: form.apartment.trim(),
      city: form.city.trim(),
      province: form.province.trim(),
      postalCode: form.postalCode.trim(),
      address: buildAddress(form),
      notes: form.notes.trim(),
    };

    const payload = {
      items: itemsPayload,
      payer: {
        email: customer.email,
        name: customer.fullName,
        phone: customer.phone,
      },
      customer,
    };

    try {
      setIsSubmitting(true);
      const response = await fetch("/api/mercadopago/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as { redirectUrl?: string; error?: string };
      if (!response.ok || !data.redirectUrl) {
        throw new Error(data.error || "No se pudo iniciar el pago. Intentá nuevamente.");
      }

      window.location.href = data.redirectUrl;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error inesperado al iniciar el pago.";
      setApiError(message);
      setIsSubmitting(false);
    }
  };

  const renderInput = (
    field: keyof CheckoutForm,
    label: string,
    required?: boolean,
    inputType: "text" | "email" = "text",
  ) => (
    <div>
      <Label htmlFor={field} required={required}>
        {label}
      </Label>
      <input
        id={field}
        type={inputType}
        required={required}
        value={form[field]}
        onChange={handleChange(field)}
        onBlur={handleBlur(field)}
        className={`w-full rounded-md border bg-white px-3 py-2 text-sm text-stone-900 outline-none transition-colors placeholder:text-stone-400 focus:border-[#029f9c] ${
          errors[field] ? "border-red-500" : "border-stone-200"
        }`}
      />
      {errors[field] ? <p className="mt-1 text-xs text-red-600">{errors[field]}</p> : null}
    </div>
  );

  return (
    <main className="min-h-screen bg-[#f8fafb] text-[#1a1a2e]">
      <SiteHeader />

      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-black tracking-wide text-stone-900">Checkout</h1>
            <p className="mt-1 text-sm text-stone-600">
              El envío se coordina luego de la compra.
            </p>
          </div>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("open-cart"))}
            className="rounded-md border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 transition-colors hover:border-stone-400 hover:bg-stone-100"
          >
            Carrito
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-lg border border-stone-200 bg-white p-4 lg:col-span-2">
            <h2 className="text-lg font-black text-stone-900">Datos</h2>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {renderInput("fullName", "Nombre y apellido", true)}
              {renderInput("phone", "WhatsApp / Teléfono", true)}
              {renderInput("email", "Email", true, "email")}
              {renderInput("street", "Calle", true)}
              {renderInput("addressNumber", "Número", true)}
              {renderInput("apartment", "Piso/Depto")}
              {renderInput("city", "Localidad", true)}
              {renderInput("province", "Provincia", true)}
              {renderInput("postalCode", "Código postal", true)}
              <div className="sm:col-span-2">
                <Label htmlFor="notes">Notas</Label>
                <textarea
                  id="notes"
                  value={form.notes}
                  onChange={handleChange("notes")}
                  onBlur={handleBlur("notes")}
                  rows={4}
                  className="w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 outline-none transition-colors placeholder:text-stone-400 focus:border-[#029f9c]"
                  placeholder="Ej: horario de entrega, referencia de domicilio, etc."
                />
              </div>
            </div>
          </div>

          <aside className="h-fit rounded-lg border border-stone-200 bg-white p-4">
            <h2 className="text-lg font-black text-stone-900">Resumen</h2>

            <div className="mt-4 space-y-2 text-sm text-stone-700">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-stone-900">{formatArs(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Envío</span>
                <span className="font-semibold text-stone-900">{shippingLabel}</span>
              </div>
              <div className="mt-3 border-t border-stone-200 pt-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-stone-900">Total</span>
                  <span className="text-lg font-black text-stone-900">{formatArs(total)}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handlePay}
              disabled={!canPay}
              className="mt-5 w-full rounded-xl bg-[#f97316] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#ea580c] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Procesando..." : "Pagar"}
            </button>
            <button
              type="button"
              onClick={clearCart}
              className="mt-2 w-full rounded-md border border-stone-300 px-4 py-2.5 text-sm font-semibold text-stone-700 transition-colors hover:border-stone-400 hover:bg-stone-100"
            >
              Vaciar carrito
            </button>

            <p className="mt-3 text-xs text-stone-600">El envío se coordina luego de la compra.</p>
            {itemsPayload.length === 0 ? (
              <p className="mt-1 text-xs text-red-600">Tu carrito está vacío.</p>
            ) : null}
            {apiError ? <p className="mt-2 text-xs text-red-600">{apiError}</p> : null}
          </aside>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
