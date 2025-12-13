import { useState, useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { ChevronUp } from "lucide-react";

import Header from "../common/navigation/Header";
import Footer from "../common/navigation/Footer";

import useReducedMotion from "../../hooks/useReducedMotion";



const MainLayout = () => {
  const location = useLocation();
  const scrollButtonRef = useRef(null);

  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isPageTransitioning, setIsPageTransitioning] = useState(false);

  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      setIsPageTransitioning(false);
      return;
    }

    setIsPageTransitioning(true);
    const timeout = window.setTimeout(() => {
      setIsPageTransitioning(false);
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [location.pathname, prefersReducedMotion]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    let timeoutId;

    const handleScroll = () => {
      if (timeoutId) clearTimeout(timeoutId);

      timeoutId = setTimeout(() => {
        const scrollY = window.pageYOffset;
        setShowScrollTop(scrollY > 400);
      }, 16);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  const scrollToTop = () => {
    if (prefersReducedMotion) {
      window.scrollTo({ top: 0, behavior: "auto" });
      return;
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      <div className="relative flex min-h-screen max-w-screen flex-col bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">

        <Header />

        <main className="relative flex-1 pt-16 sm:pt-18">
          <Outlet />
        </main>

        <div className="relative">
          <Footer />
        </div>

        <button
          ref={scrollButtonRef}
          onClick={scrollToTop}
          className={`fixed bottom-6 right-6 h-11 w-11 rounded-full border border-white/40 bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transition-all duration-200 hover:scale-105 hover:from-blue-600 hover:to-purple-700 focus:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:border-slate-700/60 dark:from-blue-400 dark:to-purple-500 dark:hover:from-blue-500 dark:hover:to-purple-600 dark:focus:ring-offset-slate-950 ${
            showScrollTop
              ? "pointer-events-auto translate-y-0 opacity-100"
              : "pointer-events-none translate-y-4 opacity-0"
          } group`}
          style={{ zIndex: 'var(--z-tooltip)' }}
          aria-label="Scroll to top"
          type="button"
        >
          <ChevronUp
            className={`h-5 w-5 mx-auto transition-transform duration-200 ${
              !prefersReducedMotion ? "group-hover:translate-y-[-3px]" : ""
            }`}
          />
        </button>

        <div
          className={`fixed left-0 right-0 top-0 h-0.5 transform bg-gradient-to-r from-blue-500 to-purple-600 transition-transform duration-200 ${
            isPageTransitioning ? "scale-x-100" : "scale-x-0"
          }`}
          style={{ zIndex: 'var(--z-toast)' }}
        />
      </div>
    </>
  );
};

export default MainLayout;
