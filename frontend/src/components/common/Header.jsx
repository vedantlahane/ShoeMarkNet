import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Menu,
  X,
  Sun,
  Moon,
  ChevronDown,
  Home,
  Grid3X3,
  Tag,
  Percent,
  LogOut,
  Monitor,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const routePrefetchers = {
  "/": () => import("../../pages/Home"),
  "/products": () => import("../../pages/Products"),
  "/categories": () => import("../../pages/Category"),
  "/sale": () => import("../../pages/Products"),
  "/cart": () => import("../../pages/Cart"),
  "/wishlist": () => import("../../pages/Wishlist"),
  "/search": () => import("../../pages/Search"),
  "/profile": () => import("../../pages/Profile"),
  "/orders": () => import("../../pages/Orders"),
  "/login": () => import("../../pages/Login"),
  "/register": () => import("../../pages/Register"),
  "/logout": () => import("../../pages/Logout"),
};

const prefetchedRoutes = new Set();

const normalizePath = (path = "/") => path.split("?")[0];

const prefetchRoute = (path) => {
  if (typeof window === "undefined") return;

  const normalized = normalizePath(path);
  if (!normalized || prefetchedRoutes.has(normalized)) return;

  const loader = routePrefetchers[normalized];
  if (!loader) return;

  prefetchedRoutes.add(normalized);
  loader().catch(() => {
    prefetchedRoutes.delete(normalized);
  });
};

// Custom hooks for accessibility
const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) {
      return undefined;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event) => {
      setPrefersReducedMotion(event.matches);
    };

    try {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    } catch (error) {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  return prefersReducedMotion;
};

const useFocusTrap = (isOpen, containerRef) => {
  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        // Close menu on escape
        return;
      }

      if (e.key === "Tab") {
        if (e.shiftKey) {
          if (document.activeElement === firstFocusable) {
            e.preventDefault();
            lastFocusable?.focus();
          }
        } else {
          if (document.activeElement === lastFocusable) {
            e.preventDefault();
            firstFocusable?.focus();
          }
        }
      }
    };

    container.addEventListener("keydown", handleKeyDown);
    firstFocusable?.focus();

    return () => {
      container.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, containerRef]);
};

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const headerRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const userMenuRef = useRef(null);
  const themeMenuRef = useRef(null);
  const searchInputRef = useRef(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const { isDarkMode, preference, setPreference } = useTheme();

  const prefersReducedMotion = useReducedMotion();

  // Redux state
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { items: cartItems } = useSelector((state) => state.cart);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);

  // Focus trap hooks
  useFocusTrap(isMenuOpen, mobileMenuRef);
  useFocusTrap(isUserMenuOpen, userMenuRef);

  // Calculations
  const cartItemCount = cartItems?.length || 0;
  const wishlistCount = wishlistItems?.length || 0;

  // Navigation links with icons
  const navigationLinks = [
    { to: "/", label: "Home", icon: Home },
    { to: "/products", label: "Products", icon: Grid3X3 },
    { to: "/categories", label: "Categories", icon: Tag },
    { to: "/sale", label: "Sale", icon: Percent, badge: "Hot" },
  ];

  const mutedText = "text-slate-600 dark:text-slate-300";
  const mutedStrong = "text-slate-700 dark:text-slate-100";
  const surfaceButton =
    "rounded-xl border border-slate-200/70 dark:border-slate-800/70 bg-white/70 dark:bg-slate-900/60 transition-all duration-200 hover:scale-105";
  const hoverSurface =
    "hover:bg-slate-200/80 dark:hover:bg-slate-700/70 hover:text-blue-600 dark:hover:text-blue-400";
  const focusRing =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900";

  const themeOptions = useMemo(
    () => [
      {
        value: "light",
        label: "Light",
        description: "Bright and crisp",
        icon: Sun,
      },
      {
        value: "dark",
        label: "Dark",
        description: "Dimmed and focused",
        icon: Moon,
      },
      {
        value: "system",
        label: "System",
        description: "Match your device",
        icon: Monitor,
      },
    ],
    []
  );

  const currentThemeOption =
    themeOptions.find((option) => option.value === preference) ||
    themeOptions[0];

  // Handle scroll effect with throttling
  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    let timeoutId;

    const handleScroll = () => {
      if (timeoutId) clearTimeout(timeoutId);

      timeoutId = setTimeout(() => {
        const scrollTop = window.scrollY;
        setIsScrolled(scrollTop > 20);
      }, 16); // ~60fps
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    const header = headerRef.current;
    if (!header || prefersReducedMotion || typeof window === "undefined") {
      return undefined;
    }

    header.style.opacity = "0";
    header.style.transform = "translateY(-40px)";

    const raf = window.requestAnimationFrame(() => {
      header.style.transition = "opacity 0.5s ease-out, transform 0.5s ease-out";
      header.style.opacity = "1";
      header.style.transform = "translateY(0)";
    });

    return () => {
      window.cancelAnimationFrame(raf);
    };
  }, [prefersReducedMotion]);

  // Close menus on escape key
  useEffect(() => {
    if (typeof document === "undefined") {
      return undefined;
    }

    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setIsMenuOpen(false);
        setIsUserMenuOpen(false);
        setIsSearchOpen(false);
        setIsThemeMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    if (typeof document === "undefined") {
      return undefined;
    }

    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
      if (
        themeMenuRef.current &&
        !themeMenuRef.current.contains(event.target)
      ) {
        setIsThemeMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const createPrefetchProps = (path) => ({
    onMouseEnter: () => prefetchRoute(path),
    onFocus: () => prefetchRoute(path),
    onTouchStart: () => prefetchRoute(path),
  });

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      prefetchRoute("/search");
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  const toggleMobileMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleUserMenuToggle = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleThemeMenuToggle = () => {
    setIsThemeMenuOpen((prev) => !prev);
  };

  const handleThemeSelect = (value) => {
    setPreference(value);
    setIsThemeMenuOpen(false);
  };

  // Focus search input when opened
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  return (
    <>
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-blue-600 text-white px-4 py-2 rounded-md"
      >
        Skip to main content
      </a>

      <header
        ref={headerRef}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 border border-slate-200/70 dark:border-slate-800/70 bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl transition-all duration-300",
          isScrolled
            ? "shadow-lg dark:shadow-black/40"
            : "shadow-sm dark:shadow-black/20"
        )}
        role="banner"
      >
        <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-5 lg:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3 md:gap-6 py-3 lg:py-4">
            {/* Logo */}
            <div className="flex items-center">
              <Link
                to="/"
                {...createPrefetchProps("/")}
                className={cn(
                  "flex items-center space-x-3 group rounded-lg p-1 transition-all duration-200",
                  focusRing
                )}
                aria-label="ShoeMarkNet Home"
              >
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-transform duration-200">
                  <span className="text-white font-bold text-xl lg:text-2xl">
                    S
                  </span>
                </div>
                <span className="hidden sm:block text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  ShoeMarkNet
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav
              className="hidden lg:flex items-center space-x-1"
              role="navigation"
              aria-label="Main navigation"
            >
              {navigationLinks.map((link) => {
                const IconComponent = link.icon;
                const isActive = location.pathname === link.to;

                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    {...createPrefetchProps(link.to)}
                    className={cn(
                      "relative px-4 py-2 rounded-xl transition-all duration-200 flex items-center space-x-2 hover:scale-105",
                      focusRing,
                      isActive
                        ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-300 shadow-sm"
                        : `${mutedText} ${hoverSurface}`
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <IconComponent size={18} aria-hidden="true" />
                    <span className="text-sm font-medium lg:text-base">
                      {link.label}
                    </span>
                    {link.badge && (
                      <span
                        className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 px-2 py-0.5 text-xs font-bold text-white rounded-full"
                        aria-label={`${link.label} has ${link.badge} items`}
                      >
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Search, Actions & User Menu */}
            <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:gap-3 md:w-auto">
              {/* Search Toggle */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className={cn(
                  surfaceButton,
                  hoverSurface,
                  focusRing,
                  "p-2 group flex items-center justify-center"
                )}
                aria-label={isSearchOpen ? "Close search" : "Open search"}
                aria-expanded={isSearchOpen}
              >
                <Search
                  size={20}
                  className={cn(
                    "transition-colors duration-200",
                    mutedText,
                    "group-hover:text-blue-600 dark:group-hover:text-blue-400"
                  )}
                  aria-hidden="true"
                />
              </button>

              {/* Theme Toggle */}
              <div className="relative" ref={themeMenuRef}>
                <button
                  onClick={handleThemeMenuToggle}
                  className={cn(
                    surfaceButton,
                    hoverSurface,
                    focusRing,
                    "flex items-center gap-2 px-3 py-2"
                  )}
                  aria-label="Select theme preference"
                  aria-haspopup="true"
                  aria-expanded={isThemeMenuOpen}
                >
                  {preference === "system" ? (
                    <Monitor
                      size={18}
                      className={cn(
                        "transition-colors duration-200",
                        mutedText,
                        "group-hover:text-blue-600 dark:group-hover:text-blue-400"
                      )}
                      aria-hidden="true"
                    />
                  ) : isDarkMode ? (
                    <Moon
                      size={18}
                      className="text-blue-400"
                      aria-hidden="true"
                    />
                  ) : (
                    <Sun
                      size={18}
                      className="text-yellow-500"
                      aria-hidden="true"
                    />
                  )}
                  <span
                    className={cn(
                      "hidden xl:inline-block text-sm font-medium transition-colors duration-200",
                      mutedText
                    )}
                  >
                    {currentThemeOption.label}
                  </span>
                  <ChevronDown
                    size={14}
                    className={cn(
                      "transition-transform duration-200",
                      mutedText,
                      isThemeMenuOpen ? "rotate-180" : ""
                    )}
                    aria-hidden="true"
                  />
                </button>

                {isThemeMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xl overflow-hidden z-50"
                    role="menu"
                    aria-label="Theme options"
                  >
                    <div className="py-1">
                      {themeOptions.map((option) => {
                        const OptionIcon = option.icon;
                        const isSelected = preference === option.value;
                        return (
                          <button
                            key={option.value}
                            onClick={() => handleThemeSelect(option.value)}
                            className={cn(
                              "w-full flex items-start gap-3 px-4 py-3 text-left transition-colors duration-200",
                              focusRing,
                              isSelected
                                ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-300"
                                : `${mutedText} hover:bg-slate-100 dark:hover:bg-slate-800`
                            )}
                            role="menuitemradio"
                            aria-checked={isSelected}
                          >
                            <OptionIcon
                              size={18}
                              className={
                                isSelected
                                  ? "text-blue-600 dark:text-blue-300"
                                  : mutedText
                              }
                              aria-hidden="true"
                            />
                            <span className="flex flex-col">
                              <span className="text-sm font-semibold leading-none">
                                {option.label}
                              </span>
                              <span className="text-xs opacity-75 mt-1">
                                {option.description}
                              </span>
                            </span>
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
                className={cn(
                  surfaceButton,
                  hoverSurface,
                  focusRing,
                  "relative p-2 group flex items-center justify-center"
                )}
                aria-label={`Wishlist with ${wishlistCount} items`}
              >
                <Heart
                  size={20}
                  className={cn(
                    "transition-colors duration-200",
                    mutedText,
                    "group-hover:text-pink-500"
                  )}
                  aria-hidden="true"
                />
                {wishlistCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                    aria-hidden="true"
                  >
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Shopping Cart */}
              <Link
                to="/cart"
                {...createPrefetchProps("/cart")}
                className={cn(
                  surfaceButton,
                  hoverSurface,
                  focusRing,
                  "relative p-2 group flex items-center justify-center"
                )}
                aria-label={`Shopping cart with ${cartItemCount} items`}
              >
                <ShoppingBag
                  size={20}
                  className={cn(
                    "transition-colors duration-200",
                    mutedText,
                    "group-hover:text-emerald-500"
                  )}
                  aria-hidden="true"
                />
                {cartItemCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                    aria-hidden="true"
                  >
                    {cartItemCount}
                  </span>
                )}
              </Link>

              {/* User Menu */}
              <div className="relative" ref={userMenuRef}>
                {isAuthenticated ? (
                  <button
                    onClick={handleUserMenuToggle}
                    className={cn(
                      surfaceButton,
                      hoverSurface,
                      focusRing,
                      "flex items-center space-x-2 p-2 group"
                    )}
                    aria-label="User menu"
                    aria-expanded={isUserMenuOpen}
                    aria-haspopup="true"
                  >
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt="Profile"
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <User
                        size={20}
                        className={cn(
                          "transition-colors duration-200",
                          mutedText,
                          "group-hover:text-blue-600 dark:group-hover:text-blue-400"
                        )}
                        aria-hidden="true"
                      />
                    )}
                    <ChevronDown
                      size={14}
                      className={cn(
                        "transition-transform duration-200",
                        mutedText,
                        isUserMenuOpen ? "rotate-180" : ""
                      )}
                      aria-hidden="true"
                    />
                  </button>
                ) : (
                  <div className="flex items-center gap-2 max-[420px]:w-full max-[420px]:flex-col max-[420px]:items-stretch">
                    <Link
                      to="/login"
                      {...createPrefetchProps("/login")}
                      className={cn(
                        "px-4 py-2 text-sm font-medium rounded-lg text-center transition-all duration-200",
                        focusRing,
                        mutedText,
                        "hover:bg-slate-100 dark:hover:bg-slate-800"
                      )}
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      {...createPrefetchProps("/register")}
                      className={cn(
                        "px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 hover:scale-105 text-center",
                        focusRing
                      )}
                    >
                      Sign Up
                    </Link>
                  </div>
                )}

                {/* User Dropdown */}
                {isAuthenticated && isUserMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-48 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xl overflow-hidden"
                    role="menu"
                    aria-labelledby="user-menu-button"
                  >
                    <div className="py-2">
                      <Link
                        to="/profile"
                        {...createPrefetchProps("/profile")}
                        className={cn(
                          "flex items-center px-4 py-2 text-sm transition-colors duration-200",
                          focusRing,
                          mutedText,
                          "hover:bg-slate-100 dark:hover:bg-slate-800"
                        )}
                        onClick={() => setIsUserMenuOpen(false)}
                        role="menuitem"
                      >
                        <User size={16} className="mr-3" aria-hidden="true" />
                        Profile
                      </Link>
                      <Link
                        to="/orders"
                        {...createPrefetchProps("/orders")}
                        className={cn(
                          "flex items-center px-4 py-2 text-sm transition-colors duration-200",
                          focusRing,
                          mutedText,
                          "hover:bg-slate-100 dark:hover:bg-slate-800"
                        )}
                        onClick={() => setIsUserMenuOpen(false)}
                        role="menuitem"
                      >
                        <ShoppingBag
                          size={16}
                          className="mr-3"
                          aria-hidden="true"
                        />
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
                        className={cn(
                          "w-full flex items-center px-4 py-2 text-sm transition-colors duration-200 text-red-500 hover:bg-red-500/10",
                          focusRing.replace("ring-blue-500", "ring-red-500")
                        )}
                        role="menuitem"
                      >
                        <LogOut size={16} className="mr-3" aria-hidden="true" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <button
                onClick={toggleMobileMenu}
                className={cn(
                  "lg:hidden p-2 rounded-xl border border-slate-200/70 dark:border-slate-800/70 bg-white/70 dark:bg-slate-900/60 transition-all duration-200 hover:scale-105",
                  hoverSurface,
                  focusRing
                )}
                aria-label={
                  isMenuOpen ? "Close mobile menu" : "Open mobile menu"
                }
                aria-expanded={isMenuOpen}
                aria-controls="mobile-menu"
              >
                {isMenuOpen ? (
                  <X
                    size={20}
                    className={cn("transition-colors duration-200", mutedText)}
                    aria-hidden="true"
                  />
                ) : (
                  <Menu
                    size={20}
                    className={cn("transition-colors duration-200", mutedText)}
                    aria-hidden="true"
                  />
                )}
              </button>
            </div>
          </div>

          {/* Search Bar */}
          {isSearchOpen && (
            <div className="py-4">
              <form onSubmit={handleSearch} className="relative" role="search">
                <label htmlFor="search-input" className="sr-only">
                  Search for shoes, brands, styles
                </label>
                <input
                  ref={searchInputRef}
                  id="search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for shoes, brands, styles..."
                  className={cn(
                    "w-full pl-12 pr-20 py-3 rounded-2xl text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 border border-slate-200/70 dark:border-slate-800/70 bg-white/70 dark:bg-slate-900/70 backdrop-blur",
                    focusRing
                  )}
                />
                <Search
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400"
                  aria-hidden="true"
                />
                <button
                  type="submit"
                  className={cn(
                    "absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm px-4 py-1.5 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200",
                    focusRing
                  )}
                >
                  Search
                </button>
              </form>
            </div>
          )}

          {/* Mobile Navigation Menu */}
          {isMenuOpen && (
            <div
              ref={mobileMenuRef}
              className="lg:hidden py-4"
              id="mobile-menu"
              role="navigation"
              aria-label="Mobile navigation"
            >
              <nav className="flex flex-col space-y-2">
                {navigationLinks.map((link) => {
                  const IconComponent = link.icon;
                  const isActive = location.pathname === link.to;

                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      {...createPrefetchProps(link.to)}
                      onClick={() => setIsMenuOpen(false)}
                      className={cn(
                        "relative flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm sm:text-base",
                        focusRing,
                        isActive
                          ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-300"
                          : `${mutedText} hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400`
                      )}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <IconComponent size={20} aria-hidden="true" />
                      <span className="font-medium">{link.label}</span>
                      {link.badge && (
                        <span className="bg-gradient-to-r from-red-500 to-pink-500 px-2 py-0.5 text-xs font-bold text-white rounded-full">
                          {link.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          )}
        </div>

        {/* Mobile menu backdrop */}
        {isMenuOpen && (
          <div
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm lg:hidden -z-10"
            onClick={() => setIsMenuOpen(false)}
            aria-hidden="true"
          />
        )}
      </header>
    </>
  );
};

export default Header;
