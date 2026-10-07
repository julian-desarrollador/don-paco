"use client";

type HeroBannerProps = {
  bannerTitle?: string;
  bannerSubtitle?: string;
  bannerLead?: string;
};

export default function HeroBanner({
  bannerTitle = "Don Paco",
  bannerSubtitle = "Pet's Shop",
  bannerLead = "Roca 473, Gral. Fernández Oro — RN",
}: HeroBannerProps) {
  return (
    <>
      <div className="w-full bg-[#e8f6f5] md:hidden">
        <img
          src="/banner.jpg"
          alt="Don Paco — bienvenidos a la tienda"
          className="mx-auto block h-auto w-full max-w-[1920px]"
          fetchPriority="high"
          decoding="async"
        />
      </div>

      <section
        className="hidden w-full overflow-hidden bg-[#1a9e7a] md:block"
        aria-label="Destacado Don Paco"
      >
        <div className="mx-auto flex h-72 max-w-[1920px] flex-row">
          <div className="relative flex h-full w-[45%] shrink-0 items-end overflow-hidden bg-[#1a9e7a]">
            <div className="relative flex h-[122%] w-full items-end overflow-hidden rounded-tr-3xl">
              <img
                src="/banner.jpg"
                alt="Don Paco Pet Shop"
                className="h-full w-full object-cover object-top"
                fetchPriority="high"
                decoding="async"
              />
            </div>
          </div>

          <div className="flex w-[55%] flex-col justify-center gap-3 px-10 py-8 text-white">
            <h2 className="text-4xl font-black tracking-tight lg:text-5xl">{bannerTitle}</h2>
            <p className="text-xl font-semibold text-white">{bannerSubtitle}</p>
            <p className="max-w-lg text-base leading-relaxed text-white/90">{bannerLead}</p>
          </div>
        </div>
      </section>
    </>
  );
}
