import React from "react";
import { Sparkles, ArrowRight, MousePointer } from "lucide-react";
import sneakerImage from "../../assets/sneaker.png";

const HeroSection = () => {
  return (
    <section
      className="relative isolate overflow-hidden pt-28 pb-16 lg:pb-32 min-h-screen flex items-center"
      aria-label="Hero section"
    >
      {/* Gradient backgrounds */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.15),_transparent_55%)] dark:bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.28),_transparent_55%)]" />
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/70 to-transparent dark:from-slate-950/70 dark:to-transparent" />

      {/* Animated floating orbs */}
      <div className="absolute left-[10%] top-[20%] h-64 w-64 rounded-full bg-sky-400/20 blur-3xl dark:bg-sky-400/10 animate-pulse" />
      <div className="absolute right-[15%] top-[30%] h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl dark:bg-indigo-400/10 animate-pulse animation-delay-2000" />
      <div className="absolute bottom-[20%] left-[20%] h-56 w-56 rounded-full bg-rose-400/20 blur-3xl dark:bg-rose-400/10 animate-pulse animation-delay-4000" />

      <div className="relative z-10 mx-auto w-full px-4 sm:px-5 lg:px-6">
        <div className="mx-auto max-w-4/5">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-center">
            {/* Left Column - Content */}
            <div className="space-y-6 lg:space-y-8 text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-3 rounded-full border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 px-4 sm:px-5 py-2 shadow-lg backdrop-blur-xl mx-auto lg:mx-0">
                <Sparkles className="h-4 w-4 text-cyan-600 dark:text-cyan-300" />
                <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.28em] text-slate-700 dark:text-slate-300">
                  Your Premium Sneaker Destination
                </span>
              </div>

              {/* Headline */}
              <div className="space-y-4">
                <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[0.95] tracking-tight">
                  <span className="block text-slate-900 dark:text-white">
                    Where Style
                  </span>
                  <span className="block bg-gradient-to-r from-sky-500 via-indigo-500 to-rose-500 dark:from-sky-400 dark:via-indigo-300 dark:to-rose-400 bg-clip-text text-transparent">
                    Meets Innovation
                  </span>
                </h1>

                {/* Description */}
                <p className="max-w-lg mx-auto lg:mx-0 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                  Discover the future of footwear shopping. Curated collections,
                  exclusive drops, and a seamless experience that puts you
                  first.
                </p>
              </div>

              {/* Stats - Mobile only */}
              <div className="grid grid-cols-3 gap-4 lg:hidden">
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    100+
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Brands
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    50K+
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Products
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    24/7
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Support
                  </p>
                </div>
              </div>

              {/* CTA Button */}
              <div className="pt-4 lg:pt-8">
                <button className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-sky-600 via-indigo-600 to-rose-600 rounded-xl blur-lg opacity-70 group-hover:opacity-100 transition duration-300 group-hover:duration-200 animate-gradient-xy"></div>
                  <div className="relative px-8 sm:px-10 lg:px-12 py-4 lg:py-5 bg-white dark:bg-slate-950 rounded-xl leading-none flex items-center justify-center gap-3">
                    <span className="text-base lg:text-lg font-semibold text-slate-900 dark:text-slate-100 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-sky-500 group-hover:via-indigo-500 group-hover:to-rose-500 transition duration-300">
                      Explore Collection
                    </span>
                    <ArrowRight className="h-5 w-5 text-slate-900 dark:text-slate-100 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                </button>
              </div>
            </div>

            {/* Right Column - Hero Sneaker Image */}
            <div className="relative py-8 lg:py-16 group cursor-pointer lg:col-span-2">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-64 w-64 sm:h-80 sm:w-80 lg:h-96 lg:w-96 bg-gradient-to-r from-sky-500/30 via-indigo-500/30 to-rose-500/30 rounded-full blur-3xl opacity-70 group-hover:opacity-100 transition-opacity duration-700" />
              </div>

              {/* Sneaker with animation */}
              <div
                className="relative transform-gpu transition-all duration-700 ease-out
                            rotate-[-15deg] sm:rotate-[-20deg] lg:rotate-[-25deg] group-hover:rotate-0 
                            scale-90 sm:scale-100 group-hover:scale-110
                            translate-y-0 group-hover:-translate-y-4"
              >
                <img
                  src={sneakerImage}
                  alt="Premium Sneaker"
                  className="w-full max-w-7xl sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl mx-auto h-auto drop-shadow-2xl
           filter group-hover:drop-shadow-[0_35px_50px_rgba(0,0,0,0.25)]
           transition-all duration-700"
                />
              </div>

              
            </div>
          </div>
        </div>
      </div>

      {/* CSS for custom animations */}
      <style jsx>{`
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @media (max-width: 640px) {
          .group:active .rotate-\
$$ -15deg\
$$ {
            transform: rotate(0deg) scale(1.05);
          }
        }
      `}</style>
    </section>
  );
};

export default HeroSection;
