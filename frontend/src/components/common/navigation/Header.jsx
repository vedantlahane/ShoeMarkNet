import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Search,
  Menu as MenuIcon,
  X,
  ChevronRight,
  Home,
  Grid3X3,
  Tag,
  Percent,
  ShoppingBag,
  Heart,
  Sun,
  Moon,
  Monitor,
  User,
  ChevronDown,
  LogOut,
} from "lucide-react";
import useLocalStorage from "../../../hooks/useLocalStorage";

const routePrefetchers = {
  "/": () => import("../../../pages/Home"),
  "/products": () => import("../../../pages/Products"),
  "/categories": () => import("../../../pages/Category"),
  "/sale": () => import("../../../pages/Products"),
  "/cart": () => import("../../../pages/Cart"),
  "/wishlist": () => import("../../../pages/Wishlist"),
  "/profile": () => import("../../../pages/Profile"),
  "/orders": () => import("../../../pages/Orders"),
  "/login": () => import("../../../pages/Login"),
  "/register": () => import("../../../pages/Register"),
  "/logout": () => import("../../../pages/Logout"),
};

const prefetched = new Set();
const normalizePath = (p = "/") => p.split("?")[0];
const prefetchRoute = (path) => {
  if (typeof window === "undefined") return;
  const n = normalizePath(path);
  if (!n || prefetched.has(n)) return;
  const loader = routePrefetchers[n];
  if (!loader) return;
  prefetched.add(n);
  loader().catch(() => prefetched.delete(n));
};

const useFocusTrap = (isOpen, ref) => {
  useEffect(() => {
    if (!isOpen || !ref.current) return;
    const el = ref.current;
    const nodes = el.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    const onKey = (e) => {
      if (e.key === "Escape") return;
      if (e.key === "Tab") {
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    el.addEventListener("keydown", onKey);
    first?.focus();
    return () => el.removeEventListener("keydown", onKey);
  }, [isOpen, ref]);
};

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Refs
  const headerRef = useRef(null);
  const searchContainerRef = useRef(null);
  const searchInputRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const userMenuRef = useRef(null);
  const themeMenuRef = useRef(null);
  const dropdownRef = useRef(null); // mobile dropdown

  // State
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // mobile menu
  const [isMenuOpen, setIsMenuOpen] = useState(false); // desktop mobile nav

  // Theme preference
  const [preference, setPreference] = useLocalStorage('theme-preference', 'system');

  // Track system preference changes
  const [systemPrefersDark, setSystemPrefersDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Listen for system preference changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => setSystemPrefersDark(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Computed theme state
  const isDarkMode = useMemo(() => {
    if (preference === 'dark') return true;
    if (preference === 'light') return false;
    return systemPrefersDark;
  }, [preference, systemPrefersDark]);

  // Store
  const { user, isAuthenticated } = useSelector((s) => s.auth || { user: null, isAuthenticated: false });
  const { items: cartItems = [] } = useSelector((s) => s.cart || { items: [] });
  const { items: wishlistItems = [] } = useSelector((s) => s.wishlist || { items: [] });
  const cartCount = cartItems.length || 0;
  const wishlistCount = wishlistItems.length || 0;


  useFocusTrap(isUserMenuOpen, userMenuRef);
  useFocusTrap(isDropdownOpen, dropdownRef);

  // Constants
  const mutedText = "text-slate-600 dark:text-slate-300";
  const surfaceBtn =
    "inline-flex items-center justify-center rounded-xl border border-slate-200/70 dark:border-slate-800/70 bg-white/70 dark:bg-slate-900/60 transition-all duration-200";
  const hoverSurface = "hover:bg-slate-200/80 dark:hover:bg-slate-700/70";
  const focusRing =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900";

  const navLinks = useMemo(
    () => [
      { to: "/", label: "Home", icon: Home },
      { to: "/products", label: "Products", icon: Grid3X3 },
      { to: "/categories", label: "Categories", icon: Tag },
      { to: "/sale", label: "Sale", icon: Percent, badge: "Hot" },
    ],
    []
  );

  const themeOptions = useMemo(
    () => [
      { value: "light", label: "Light", icon: Sun, desc: "Bright and crisp" },
      { value: "dark", label: "Dark", icon: Moon, desc: "Dimmed and focused" },
      { value: "system", label: "System", icon: Monitor, desc: "Match device" },
    ],
    []
  );

  // Effects
  useEffect(() => {
    if (typeof window === "undefined") return;
    let t;
    const onScroll = () => {
      if (t) clearTimeout(t);
      t = setTimeout(() => setIsScrolled(window.scrollY > 20), 16);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (t) clearTimeout(t);
    };
  }, []);

  useEffect(() => {
    const h = headerRef.current;
    if (!h || typeof window === "undefined") return;
    h.style.opacity = "0";
    h.style.transform = "translateY(-40px)";
    const raf = window.requestAnimationFrame(() => {
      h.style.transition = "opacity 0.5s ease-out, transform 0.5s ease-out";
      h.style.opacity = "1";
      h.style.transform = "translateY(0)";
    });
    return () => window.cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const onKey = (e) => {
      if (e.key === "Escape") {
        setIsDropdownOpen(false);
        setIsUserMenuOpen(false);
        setIsSearchOpen(false);
        setIsThemeMenuOpen(false);
        setIsMenuOpen(false);
      }
    };
    const onDown = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target)) {
        setIsThemeMenuOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Helpers
  const createPrefetchProps = (path) => ({
    onMouseEnter: () => prefetchRoute(path),
    onFocus: () => prefetchRoute(path),
    onTouchStart: () => prefetchRoute(path),
  });

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    prefetchRoute("/search");
    navigate(`/search?q=${encodeURIComponent(q)}`);
    setIsSearchOpen(false);
    setSearchQuery("");
  };

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  useEffect(() => {
    if (isSearchOpen) prefetchRoute("/search");
  }, [isSearchOpen]);

  // Render
  return (
    <header
      ref={headerRef}
      className={`fixed top-0 left-0 right-0 border-b border-slate-200/70 dark:border-slate-800/70 bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl transition-all duration-300 pt-[env(safe-area-inset-top)] ${isScrolled ? "shadow-md dark:shadow-black/30" : "shadow-sm dark:shadow-black/10"}`}
      style={{ zIndex: 'var(--z-fixed)' }}
      role="banner"
    >
      <div className="container-app">
        {/* MOBILE BAR: logo + search + dropdown (only < lg) */}
        <div className="flex items-center justify-between gap-2 py-2 lg:hidden">
          {/* Logo */}
          <Link
            to="/"
            {...createPrefetchProps("/")}
            className={"flex items-center gap-2 p-1 rounded-lg " + focusRing}
            aria-label="ShoeMarkNet Home"
          >
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-xl shadow-md" />
              <div className="relative w-full h-full flex items-center justify-center">
                <span className="text-lg font-bold text-white">S</span>
              </div>
            </div>
            <div className="hidden sm:block leading-none">
              <h1 className="text-base font-bold text-slate-900 dark:text-white">
                ShoeMarkNet
              </h1>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Premium Footwear</p>
            </div>
          </Link>

          <div className="flex items-center gap-1.5">
            {/* Search toggle */}
            <div className="relative" ref={searchContainerRef}>
              <button
                onClick={() => setIsSearchOpen((v) => !v)}
                className={surfaceBtn + " " + hoverSurface + " " + focusRing + " px-2 py-2 min-h-[44px] min-w-[44px]"}
                aria-label={isSearchOpen ? "Close search" : "Open search"}
                aria-expanded={isSearchOpen}
                aria-haspopup="true"
              >
                {isSearchOpen ? <X className="h-5 w-5 text-rose-500" aria-hidden="true" /> : <Search className={"h-5 w-5 " + mutedText} aria-hidden="true" />}
              </button>

              {isSearchOpen && (
                <div
                  className={`fixed inset-x-0 top-0 pt-[env(safe-area-inset-top)] w-screen rounded-none bg-white/95 dark:bg-slate-900/90 p-3 shadow-xl backdrop-blur z-50`}
                  role="search"
                >
                  <form onSubmit={handleSearchSubmit}>
                    <label htmlFor="global-search" className="sr-only">Search ShoeMarkNet</label>
                    <div className="flex flex-col gap-3">
                      <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" aria-hidden="true" />
                        <input
                          ref={searchInputRef}
                          id="global-search"
                          type="search"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search shoes, brands..."
                          className="w-full rounded-xl border border-slate-200/70 bg-white pl-9 pr-3 py-2 text-sm text-slate-900 shadow-inner transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-slate-800/70 dark:bg-slate-900 dark:text-white dark:focus-visible:ring-offset-slate-900"
                          autoComplete="off"
                        />
                      </div>
                      <button
                        type="submit"
                        className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-3 py-2 text-sm font-semibold text-white shadow transition-all duration-200 hover:from-blue-600 hover:to-purple-700 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900"
                      >
                        Search
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* Single dropdown button (mobile only) */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen((v) => !v)}
                className={surfaceBtn + " " + hoverSurface + " " + focusRing + " px-2 py-2 min-h-[44px] min-w-[44px]"}
                aria-label="Open menu"
                aria-haspopup="menu"
                aria-expanded={isDropdownOpen}
              >
                <MenuIcon className={"h-5 w-5 " + mutedText} aria-hidden="true" />
              </button>

              {isDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-72 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xl overflow-hidden z-50"
                  role="menu"
                  aria-label="Main menu"
                >
                  {/* Nav */}
                  <nav className="py-1">
                    {navLinks.map((l) => {
                      const Icon = l.icon;
                      const active = location.pathname === l.to;
                      return (
                        <Link
                          key={l.to}
                          to={l.to}
                          {...createPrefetchProps(l.to)}
                          onClick={() => setIsDropdownOpen(false)}
                          className={`flex items-center gap-3 px-4 py-2 text-sm transition-colors duration-200 ${active ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-300" : `${mutedText} hover:bg-slate-100 dark:hover:bg-slate-800`}`}
                          role="menuitem"
                          aria-current={active ? "page" : undefined}
                        >
                          <Icon className="h-5 w-5" aria-hidden="true" />
                          <span className="flex-1">{l.label}</span>
                          {l.badge && (
                            <span className="ml-2 inline-flex items-center rounded-full bg-pink-500 px-2 py-0.5 text-[10px] font-bold text-white">
                              {l.badge}
                            </span>
                          )}
                          <ChevronRight className="h-4 w-4 opacity-60" aria-hidden="true" />
                        </Link>
                      );
                    })}
                  </nav>

                  <hr className="my-1 border-slate-200/70 dark:border-slate-800/70" />

                  {/* Theme */}
                  <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Theme
                  </div>
                  <div className="pb-1">
                    {themeOptions.map((opt) => {
                      const Icon = opt.icon;
                      const selected = preference === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => {
                            setPreference(opt.value);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-2 text-left text-sm transition-colors duration-200 ${selected ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-300" : `${mutedText} hover:bg-slate-100 dark:hover:bg-slate-800`}`}
                          role="menuitemradio"
                          aria-checked={selected}
                        >
                          <Icon className={"h-5 w-5 " + (selected ? "text-blue-600 dark:text-blue-300" : mutedText)} aria-hidden="true" />
                          <span className="flex-1">{opt.label}</span>
                          <span className="text-[11px] opacity-70">{opt.desc}</span>
                        </button>
                      );
                    })}
                  </div>

                  <hr className="my-1 border-slate-200/70 dark:border-slate-800/70" />

                  {/* Wishlist */}
                  <Link
                    to="/wishlist"
                    {...createPrefetchProps("/wishlist")}
                    onClick={() => setIsDropdownOpen(false)}
                    className={"flex items-center gap-3 px-4 py-2 text-sm transition-colors duration-200 " + mutedText + " hover:bg-slate-100 dark:hover:bg-slate-800"}
                    role="menuitem"
                  >
                    <Heart className="h-5 w-5" aria-hidden="true" />
                    <span className="flex-1">Wishlist</span>
                    {wishlistCount > 0 && (
                      <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-pink-500 px-1.5 text-[10px] font-bold text-white">
                        {wishlistCount}
                      </span>
                    )}
                  </Link>

                  {/* Cart */}
                  <Link
                    to="/cart"
                    {...createPrefetchProps("/cart")}
                    onClick={() => setIsDropdownOpen(false)}
                    className={"flex items-center gap-3 px-4 py-2 text-sm transition-colors duration-200 " + mutedText + " hover:bg-slate-100 dark:hover:bg-slate-800"}
                    role="menuitem"
                  >
                    <ShoppingBag className="h-5 w-5" aria-hidden="true" />
                    <span className="flex-1">Cart</span>
                    {cartCount > 0 && (
                      <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-500 px-1.5 text-[10px] font-bold text-white">
                        {cartCount}
                      </span>
                    )}
                  </Link>

                  {/* Admin (optional) */}
                  {isAuthenticated && (user?.role?.toLowerCase?.() === "admin") && (
                    <>
                      <hr className="my-1 border-slate-200/70 dark:border-slate-800/70" />
                      <Link
                        to="/admin"
                        {...createPrefetchProps("/admin")}
                        onClick={() => setIsDropdownOpen(false)}
                        className={"flex items-center gap-3 px-4 py-2 text-sm transition-colors duration-200 " + mutedText + " hover:bg-slate-100 dark:hover:bg-slate-800"}
                        role="menuitem"
                      >
                        <span className="h-5 w-5 rounded bg-blue-500/15 text-blue-600 dark:text-blue-300 inline-flex items-center justify-center text-[11px] font-bold">A</span>
                        <span className="flex-1">Admin</span>
                        <ChevronRight className="h-4 w-4 opacity-60" aria-hidden="true" />
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* DESKTOP BAR: old layout (lg and up) */}
        <div className="hidden lg:block">
          <div className="flex items-center justify-between gap-3 py-3 lg:py-4">
            {/* Logo with text */}
            <div className="flex items-center">
              <Link
                to="/"
                {...createPrefetchProps("/")}
                className={"flex items-center space-x-3 group rounded-lg p-1 transition-all duration-200 " + focusRing}
                aria-label="ShoeMarkNet Home"
              >
                <div className="relative w-11 h-11">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-xl shadow-lg" />
                  <div className="relative w-full h-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">S</span>
                  </div>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                    ShoeMarkNet
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium -mt-0.5">Premium Footwear</p>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="flex items-center space-x-1" role="navigation" aria-label="Main navigation">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    {...createPrefetchProps(link.to)}
                    className={`relative px-4 py-2 rounded-xl transition-all duration-200 flex items-center space-x-2 hover:scale-105 ${focusRing} ${isActive ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-300 shadow-sm" : `${mutedText} hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400`}`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                    <span className="text-base font-medium">{link.label}</span>
                    {link.badge && (
                      <span className="ml-1.5 inline-flex items-center bg-gradient-to-r from-red-500 to-pink-500 px-1.5 py-0.5 text-[10px] font-bold text-white rounded-full">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Actions: Search, Theme, Wishlist, Cart, User */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative" ref={searchContainerRef}>
                <button
                  onClick={() => setIsSearchOpen((v) => !v)}
                  className={surfaceBtn + " " + hoverSurface + " " + focusRing + " p-2"}
                  aria-label={isSearchOpen ? "Close search" : "Open search"}
                  aria-expanded={isSearchOpen}
                  aria-haspopup="true"
                >
                  {isSearchOpen ? (
                    <X className="h-5 w-5 text-rose-500" aria-hidden="true" />
                  ) : (
                    <Search className={"h-5 w-5 " + mutedText} aria-hidden="true" />
                  )}
                </button>
                {isSearchOpen && (
                  <div
                    className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-white dark:bg-slate-900 p-3 shadow-xl z-50"
                    role="search"
                  >
                    <form onSubmit={handleSearchSubmit}>
                      <label htmlFor="global-search-desktop" className="sr-only">
                        Search ShoeMarkNet
                      </label>
                      <div className="flex flex-col gap-3">
                        <div className="relative">
                          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" aria-hidden="true" />
                          <input
                            id="global-search-desktop"
                            type="search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search shoes, brands..."
                            className="w-full rounded-xl border border-slate-200/70 bg-white pl-9 pr-3 py-2 text-sm text-slate-900 shadow-inner transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-slate-800/70 dark:bg-slate-900 dark:text-white dark:focus-visible:ring-offset-slate-900"
                            autoComplete="off"
                          />
                        </div>
                        <button
                          type="submit"
                          className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-3 py-2 text-sm font-semibold text-white shadow transition-all duration-200 hover:from-blue-600 hover:to-purple-700 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900"
                        >
                          Search
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>

              {/* Theme */}
              <div className="relative" ref={themeMenuRef}>
                <button
                  onClick={() => setIsThemeMenuOpen((v) => !v)}
                  className={surfaceBtn + " " + hoverSurface + " " + focusRing + " flex items-center gap-2 px-3 py-2"}
                  aria-label="Select theme preference"
                  aria-haspopup="menu"
                  aria-expanded={isThemeMenuOpen}
                >
                  {preference === "system" ? (
                    <Monitor className={"h-5 w-5 " + mutedText} aria-hidden="true" />
                  ) : isDarkMode ? (
                    <Moon className="h-5 w-5 text-blue-400" aria-hidden="true" />
                  ) : (
                    <Sun className="h-5 w-5 text-yellow-500" aria-hidden="true" />
                  )}
                  <ChevronDown className={"h-3.5 w-3.5 " + mutedText + (isThemeMenuOpen ? " rotate-180" : "")} aria-hidden="true" />
                </button>
                {isThemeMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xl overflow-hidden z-50" role="menu" aria-label="Theme options">
                    <div className="py-1">
                      {themeOptions.map((opt) => {
                        const Icon = opt.icon;
                        const selected = preference === opt.value;
                        return (
                          <button
                            key={opt.value}
                            onClick={() => {
                              setPreference(opt.value);
                              setIsThemeMenuOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors duration-200 ${selected ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-300" : `${mutedText} hover:bg-slate-100 dark:hover:bg-slate-800`}`}
                            role="menuitemradio"
                            aria-checked={selected}
                          >
                            <Icon className={"h-5 w-5 " + (selected ? "text-blue-600 dark:text-blue-300" : mutedText)} aria-hidden="true" />
                            <span className="text-sm font-semibold leading-none">{opt.label}</span>
                            <span className="ml-2 text-xs opacity-75">{opt.desc}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Wishlist */}
              <Link
                to="/wishlist"
                {...createPrefetchProps("/wishlist")}
                className={surfaceBtn + " " + hoverSurface + " " + focusRing + " relative p-2"}
                aria-label={`Wishlist with ${wishlistCount} items`}
              >
                <Heart className={"h-5 w-5 " + mutedText} aria-hidden="true" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center" aria-hidden="true">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link
                to="/cart"
                {...createPrefetchProps("/cart")}
                className={surfaceBtn + " " + hoverSurface + " " + focusRing + " relative p-2"}
                aria-label={`Shopping cart with ${cartCount} items`}
              >
                <ShoppingBag className={"h-5 w-5 " + mutedText} aria-hidden="true" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center" aria-hidden="true">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* User */}
              <div className="relative" ref={userMenuRef}>
                {isAuthenticated ? (
                  <button
                    onClick={() => setIsUserMenuOpen((v) => !v)}
                    className={surfaceBtn + " " + hoverSurface + " " + focusRing + " p-2"}
                    aria-label="User menu"
                    aria-expanded={isUserMenuOpen}
                    aria-haspopup="true"
                  >
                    {user?.avatar ? (
                      <img src={user.avatar} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <User className={"h-5 w-5 " + mutedText} aria-hidden="true" />
                    )}
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link
                      to="/login"
                      {...createPrefetchProps("/login")}
                      className={"px-4 py-2 text-sm font-medium rounded-lg " + focusRing + " " + mutedText + " hover:bg-slate-100 dark:hover:bg-slate-800"}
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      {...createPrefetchProps("/register")}
                      className={"px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 " + focusRing}
                    >
                      Sign Up
                    </Link>
                  </div>
                )}

                {isAuthenticated && isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xl overflow-hidden" role="menu" aria-labelledby="user-menu-button">
                    <div className="py-2">
                      <Link
                        to="/profile"
                        {...createPrefetchProps("/profile")}
                        className={"flex items-center px-4 py-2 text-sm transition-colors duration-200 " + focusRing + " " + mutedText + " hover:bg-slate-100 dark:hover:bg-slate-800"}
                        onClick={() => setIsUserMenuOpen(false)}
                        role="menuitem"
                      >
                        <User className="h-4 w-4 mr-3" aria-hidden="true" />
                        Profile
                      </Link>
                      <Link
                        to="/orders"
                        {...createPrefetchProps("/orders")}
                        className={"flex items-center px-4 py-2 text-sm transition-colors duration-200 " + focusRing + " " + mutedText + " hover:bg-slate-100 dark:hover:bg-slate-800"}
                        onClick={() => setIsUserMenuOpen(false)}
                        role="menuitem"
                      >
                        <ShoppingBag className="h-4 w-4 mr-3" aria-hidden="true" />
                        Orders
                      </Link>
                      <hr className="my-2 border-slate-200/70 dark:border-slate-800/70" />
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setIsMenuOpen(false);
                          prefetchRoute("/logout");
                          navigate("/logout");
                        }}
                        className={"w-full flex items-center px-4 py-2 text-sm transition-colors duration-200 text-red-500 hover:bg-red-500/10 " + focusRing.replace("ring-blue-500", "ring-red-500")}
                        role="menuitem"
                      >
                        <LogOut className="h-4 w-4 mr-3" aria-hidden="true" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};

export default Header;
