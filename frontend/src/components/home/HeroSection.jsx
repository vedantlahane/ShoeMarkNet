import React from "react";
import { Sparkles, ArrowRight, MousePointer } from "lucide-react";
import sneakerImage from "../../assets/sneaker.png";

const HeroSection = () => {
  return (
    <section
      className="relative isolate overflow-hidden pt-20 pb-12 lg:pb-20 min-h-[85vh] flex items-center"
      aria-label="Hero section"
    >
      {/* Gradient backgrounds */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),_transparent_50%)] dark:bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.2),_transparent_50%)]" />

      {/* Animated floating orbs */}
      <div className="absolute left-[10%] top-[20%] h-48 w-48 rounded-full bg-sky-400/15 blur-3xl dark:bg-sky-400/10 animate-pulse" />
      <div className="absolute right-[15%] top-[30%] h-56 w-56 rounded-full bg-indigo-400/15 blur-3xl dark:bg-indigo-400/10 animate-pulse" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-[20%] left-[20%] h-44 w-44 rounded-full bg-rose-400/15 blur-3xl dark:bg-rose-400/10 animate-pulse" style={{ animationDelay: '4s' }} />

      <div className="container-app relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10 items-center">
          {/* Left Column - Content */}
          <div className="space-y-5 lg:space-y-6 text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 px-3 py-1.5 shadow-sm backdrop-blur-xl mx-auto lg:mx-0">
              <Sparkles className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-300" />
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 dark:text-slate-300">
                Your Premium Sneaker Destination
              </span>
            </div>

            {/* Headline */}
            <div className="space-y-3">
              <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-[1.1] tracking-tight">
                <span className="block text-slate-900 dark:text-white">
                  Where Style
                </span>
                <span className="block bg-gradient-to-r from-sky-500 via-indigo-500 to-rose-500 dark:from-sky-400 dark:via-indigo-300 dark:to-rose-400 bg-clip-text text-transparent">
                  Meets Innovation
                </span>
              </h1>

              {/* Description */}
              <p className="max-w-md mx-auto lg:mx-0 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                Discover the future of footwear shopping. Curated collections,
                exclusive drops, and a seamless experience that puts you
                first.
              </p>
            </div>

            {/* Stats - Mobile only */}
            <div className="grid grid-cols-3 gap-3 lg:hidden">
              <div className="text-center p-2 rounded-lg bg-white/50 dark:bg-slate-800/50">
                <p className="text-xl font-bold text-slate-900 dark:text-white">
                  100+
                </p>
                <p className="text-[10px] text-slate-600 dark:text-slate-400">
                  Brands
                </p>
              </div>
              <div className="text-center p-2 rounded-lg bg-white/50 dark:bg-slate-800/50">
                <p className="text-xl font-bold text-slate-900 dark:text-white">
                  50K+
                </p>
                <p className="text-[10px] text-slate-600 dark:text-slate-400">
                  Products
                </p>
              </div>
              <div className="text-center p-2 rounded-lg bg-white/50 dark:bg-slate-800/50">
                <p className="text-xl font-bold text-slate-900 dark:text-white">
                  24/7
                </p>
                <p className="text-[10px] text-slate-600 dark:text-slate-400">
                  Support
                </p>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-3 lg:pt-5">
              <button className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-sky-600 via-indigo-600 to-rose-600 rounded-xl blur-md opacity-60 group-hover:opacity-90 transition duration-300"></div>
                <div className="relative px-6 sm:px-8 lg:px-10 py-3 lg:py-4 bg-white dark:bg-slate-950 rounded-xl leading-none flex items-center justify-center gap-2">
                  <span className="text-sm lg:text-base font-semibold text-slate-900 dark:text-slate-100 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-sky-500 group-hover:via-indigo-500 group-hover:to-rose-500 transition duration-300">
                    Explore Collection
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-900 dark:text-slate-100 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all duration-300" />
                </div>
              </button>
            </div>
          </div>

          {/* Right Column - Hero Sneaker Image */}
          <div className="relative py-6 lg:py-10 group cursor-pointer lg:col-span-2">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-52 w-52 sm:h-64 sm:w-64 lg:h-80 lg:w-80 bg-gradient-to-r from-sky-500/25 via-indigo-500/25 to-rose-500/25 rounded-full blur-3xl opacity-70 group-hover:opacity-100 transition-opacity duration-700" />
            </div>

            {/* Sneaker with animation */}
            <div
              className="relative transform-gpu transition-all duration-700 ease-out
                          rotate-[-12deg] sm:rotate-[-18deg] lg:rotate-[-22deg] group-hover:rotate-0 
                          scale-95 sm:scale-100 group-hover:scale-105
                          translate-y-0 group-hover:-translate-y-3"
            >
              <img
                src={sneakerImage}
                alt="Premium Sneaker"
                className="w-full max-w-lg sm:max-w-xl lg:max-w-3xl xl:max-w-4xl mx-auto h-auto drop-shadow-xl
         filter group-hover:drop-shadow-[0_30px_40px_rgba(0,0,0,0.2)]
         transition-all duration-700"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
