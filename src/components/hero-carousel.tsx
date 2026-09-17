"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type HeroSlide = {
  id: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  imageSrc: string;
  tone: "teal" | "navy" | "sunset";
};

const TONE_CLASS: Record<HeroSlide["tone"], string> = {
  teal: "from-[#017d7a] via-[#029f9c] to-[#0d9488]",
  navy: "from-[#1a1a2e] via-[#16213e] to-[#0f766e]",
  sunset: "from-[#c2410c] via-[#ea580c] to-[#029f9c]",
};

type HeroCarouselProps = {
  slides: HeroSlide[];
};

export default function HeroCarousel({ slides }: HeroCarouselProps) {
  const [index, setIndex] = useState(0);
  const safeSlides = slides.length > 0 ? slides : [];
  const current = safeSlides[index] ?? safeSlides[0];

  useEffect(() => {
    if (safeSlides.length < 2) return;
    const id = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % safeSlides.length);
    }, 5500);
    return () => window.clearInterval(id);
  }, [safeSlides.length]);

  if (!current) return null;

  const go = (dir: -1 | 1) => {
    setIndex((prev) => (prev + dir + safeSlides.length) % safeSlides.length);
  };

  return (
    <section className="relative overflow-hidden" aria-label="Promociones Don Paco" aria-roledescription="carousel">
      <div className={`bg-gradient-to-br ${TONE_CLASS[current.tone]}`}>
        <div className="mx-auto grid min-h-[320px] w-full max-w-[1440px] items-center md:min-h-[380px] lg:grid-cols-[1.05fr_0.95fr] lg:min-h-[420px]">
          <div className="order-2 flex flex-col justify-center px-5 py-8 text-white md:px-10 lg:order-1 lg:py-12">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-white/75">Don Paco Pet Shop</p>
            <h2 className="max-w-xl text-3xl font-extrabold leading-tight tracking-tight md:text-5xl">{current.title}</h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/90 md:text-base">{current.subtitle}</p>
            <Link
              href={current.ctaHref}
              className="mt-6 inline-flex w-fit items-center rounded-full bg-[#f97316] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-orange-950/20 transition hover:bg-[#ea580c]"
            >
              {current.ctaLabel}
            </Link>
          </div>
          <div className="relative order-1 h-52 w-full md:h-72 lg:order-2 lg:h-full lg:min-h-[420px]">
            <Image
              src={current.imageSrc}
              alt=""
              fill
              priority={index === 0}
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent lg:bg-gradient-to-l" />
          </div>
        </div>
      </div>

      {safeSlides.length > 1 ? (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            className="absolute left-3 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#1a1a2e] shadow md:inline-flex"
            aria-label="Slide anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            className="absolute right-3 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#1a1a2e] shadow md:inline-flex"
            aria-label="Slide siguiente"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
            {safeSlides.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                aria-label={`Ir al slide ${i + 1}`}
                aria-current={i === index}
                onClick={() => setIndex(i)}
                className={`h-2.5 rounded-full transition-all ${i === index ? "w-7 bg-white" : "w-2.5 bg-white/50"}`}
              />
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}
