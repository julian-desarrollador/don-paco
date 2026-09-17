const BRANDS = [
  "Sieger",
  "Royal Canin",
  "7 Vida",
  "Nutricare",
  "Excellent",
  "Old Prince",
  "Eukanuba",
  "Pedigree",
  "Agility",
  "Whiskas",
];

export default function BrandsSection() {
  return (
    <section className="mx-auto w-full max-w-[1440px] px-4 py-12 md:px-6" aria-label="Marcas">
      <div className="mb-6 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#029f9c]">Calidad que tu mascota nota</p>
        <h2 className="mt-1 text-2xl font-extrabold text-[#1a1a2e]">Marcas que trabajamos</h2>
      </div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
        {BRANDS.map((brand) => (
          <li
            key={brand}
            className="flex h-20 items-center justify-center rounded-2xl border border-[#e2e8f0] bg-white px-3 text-center text-sm font-extrabold uppercase tracking-wide text-[#1a1a2e] shadow-sm"
          >
            {brand}
          </li>
        ))}
      </ul>
    </section>
  );
}
