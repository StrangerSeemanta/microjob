"use client";

import React, { useEffect, useState } from "react";

type BannerData = {
  _id: string;
  title: string;
  imageUrl: string;
  linkUrl?: string;
};

function Banner() {
  const [banners, setBanners] = useState<BannerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function fetchBanners() {
      try {
        const response = await fetch("/api/banners", {
          method: "GET",
          cache: "no-store",
        });

        const data = await response.json();

        if (cancelled) return;

        if (!response.ok || !data.success) {
          console.error("Failed to fetch banners:", data.message);
          return;
        }

        setBanners(data.banners || []);
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to fetch banners:", error);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchBanners();

    return () => {
      cancelled = true;
    };
  }, []);

  // Automatically change banner every 5 seconds
  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((previous) => {
        return (previous + 1) % banners.length;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [banners.length]);

//   if (loading) {
//     return (
//       <div className="w-full overflow-hidden rounded-2xl bg-slate-400">
//         <div className="aspect-16/5 w-full animate-pulse sm:aspect-16/4 lg:aspect-16/3.5" />
//       </div>
//     );
//   }

  if (banners.length === 0) {
    return null;
  }

  const currentBanner = banners[currentIndex];

  if (!currentBanner) {
    return null;
  }

  const bannerContent = (
    <div className="relative w-full overflow-hidden rounded-2xl bg-gray-100">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={currentBanner.imageUrl}
        alt={currentBanner.title}
        className="block aspect-16/5 w-full object-cover sm:aspect-16/4 lg:aspect-16/3.5"
      />

      {/* Banner title */}
      {currentBanner.title && (
        <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/60 to-transparent px-4 pb-4 pt-10">
          <p className="text-sm font-semibold text-white sm:text-base">
            {currentBanner.title}
          </p>
        </div>
      )}

      {/* Dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
          {banners.map((banner, index) => (
            <button
              key={banner._id}
              type="button"
              aria-label={`Show banner ${index + 1}`}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setCurrentIndex(index);
              }}
              className={`h-1.5 rounded-full transition-all ${
                index === currentIndex ? "w-5 bg-slate-500" : "w-1.5 bg-white/60"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <section className="w-full">
      {currentBanner.linkUrl ? (
        <a
          href={currentBanner.linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          {bannerContent}
        </a>
      ) : (
        bannerContent
      )}
    </section>
  );
}

export default Banner;
