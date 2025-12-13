import React, { useRef, useEffect, useState, useCallback, memo } from "react";
import {
  Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube, Linkedin,
  ArrowUp, Heart, Shield, Truck, CreditCard,
} from "lucide-react";
import { showSuccessToast, showErrorToast } from "../../../utils/toast.jsx";
import usePrefersReducedMotion from "../../../hooks/usePrefersReducedMotion";

// --- UTILITY & DATA ---

const cn = (...classes) => classes.filter(Boolean).join(" ");

const footerData = {
  features: [
    { icon: Truck, text: "Free Shipping Over $100" },
    { icon: Shield, text: "30-Day Returns Guarantee" },
    { icon: CreditCard, text: "Secure & Encrypted Payments" },
  ],
  links: {
    company: [
      { name: "About Us", href: "/about" }, { name: "Our Story", href: "/story" },
      { name: "Careers", href: "/careers" }, { name: "Press", href: "/press" }, { name: "Blog", href: "/blog" },
    ],
    help: [
      { name: "Customer Service", href: "/support" }, { name: "Size Guide", href: "/size-guide" },
      { name: "Shipping Info", href: "/shipping" }, { name: "Returns", href: "/returns" }, { name: "FAQ", href: "/faq" },
    ],
    legal: [
      { name: "Privacy Policy", href: "/privacy" }, { name: "Terms of Service", href: "/terms" },
      { name: "Cookie Policy", href: "/cookies" }, { name: "Accessibility", href: "/accessibility" },
    ],
  },
  socials: [
    { icon: Facebook, href: "https://facebook.com/shoemarknet", name: "Facebook", followers: "2.5M" },
    { icon: Instagram, href: "https://instagram.com/shoemarknet", name: "Instagram", followers: "1.8M" },
    { icon: Twitter, href: "https://twitter.com/shoemarknet", name: "Twitter", followers: "890K" },
    { icon: Youtube, href: "https://youtube.com/shoemarknet", name: "YouTube", followers: "650K" },
    { icon: Linkedin, href: "https://linkedin.com/company/shoemarknet", name: "LinkedIn", followers: "320K" },
  ],
  contact: {
    email: "support@shoemarknet.com",
    phone: "+1 (555) 123-4567",
    address: "123 Fashion Ave, NY 10001",
  },
};

const styles = {
  mutedText: "text-slate-600 dark:text-slate-300",
  mutedStrong: "text-slate-700 dark:text-slate-100",
  glassPanel: "rounded-xl border border-slate-200/60 dark:border-slate-800/70 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl shadow-sm",
  focusRing: "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-950",
};

// --- SUB-COMPONENTS ---

const FeatureBar = memo(({ features, shimmerClass, floatClass }) => (
  <div className="py-6 border-b border-slate-200/60 dark:border-slate-800/70 footer-animate-child">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {features.map((feature, index) => (
        <div key={index} className={cn("relative p-3 overflow-hidden transition-all duration-500 flex items-center justify-center space-x-3 text-center", styles.glassPanel, "hover:bg-slate-100/60 dark:hover:bg-slate-800/60")}>
          <div className={cn("absolute inset-[1px] rounded-[0.65rem] bg-gradient-to-r from-blue-500/0 via-blue-500/20 to-purple-500/0 opacity-40", shimmerClass)} aria-hidden="true" />
          <feature.icon className={cn("relative z-10 h-5 w-5 text-blue-500 shrink-0", floatClass)} aria-hidden="true" style={{ animationDelay: `${index * 150}ms` }} />
          <span className="relative z-10 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200">{feature.text}</span>
        </div>
      ))}
    </div>
  </div>
));
FeatureBar.displayName = "FeatureBar";

const FooterInfo = memo(({ contact, shimmerClass }) => (
  <div className="flex flex-col items-center text-center gap-6 lg:items-start lg:text-left">
    <a href="/" className={cn("flex items-center justify-center space-x-3", styles.focusRing, "rounded-lg")}>
      <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
        <span className="text-xl font-bold" aria-hidden="true">S</span>
      </div>
      <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent sm:text-2xl">ShoeMarkNet</span>
    </a>
    <p className={cn("text-sm leading-relaxed max-w-sm sm:text-base", styles.mutedText)}>
      Premium footwear for every step of your journey. Quality, comfort, and style in every pair.
    </p>
    <div className="space-y-4 w-full max-w-sm">
      <ContactItem icon={Mail} href={`mailto:${contact.email}`} text={contact.email} shimmerClass={shimmerClass} iconColor="text-blue-500" />
      <ContactItem icon={Phone} href={`tel:${contact.phone.replace(/\D/g, '')}`} text={contact.phone} shimmerClass={shimmerClass} iconColor="text-emerald-500" />
      <ContactItem icon={MapPin} text={contact.address} shimmerClass={shimmerClass} iconColor="text-pink-500" />
    </div>
  </div>
));
FooterInfo.displayName = "FooterInfo";

const ContactItem = memo(({ icon: Icon, href, text, shimmerClass, iconColor }) => (
  <div className={cn("relative overflow-hidden transition-all duration-300 group", styles.glassPanel, "p-3")}>
    <div className={cn("absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500", shimmerClass)} aria-hidden="true" />
    <div className="flex items-center space-x-3">
      <Icon className={cn("h-5 w-5 group-hover:scale-110 transition-transform duration-300 shrink-0", iconColor)} aria-hidden="true" />
      {href ? (
        <a href={href} className={cn("text-sm sm:text-base transition-colors duration-300", styles.mutedText, "hover:text-slate-900 dark:hover:text-white")}>{text}</a>
      ) : (
        <span className={cn("text-sm sm:text-base", styles.mutedText)}>{text}</span>
      )}
    </div>
  </div>
));
ContactItem.displayName = "ContactItem";

const LinkSection = memo(({ title, links }) => (
  <nav aria-label={`${title} links`}>
    <h3 className={cn("text-base font-semibold mb-6", styles.mutedStrong)}>{title}</h3>
    <ul className="space-y-3">
      {links.map((link) => (
        <li key={link.name}>
          <a href={link.href} className={cn("inline-block rounded text-sm sm:text-base transition-all duration-300", styles.mutedText, "hover:translate-x-1 hover:text-blue-500 dark:hover:text-blue-400", styles.focusRing)}>
            {link.name}
          </a>
        </li>
      ))}
    </ul>
  </nav>
));
LinkSection.displayName = "LinkSection";

const Newsletter = memo(() => {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleNewsletterSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showErrorToast("Please enter a valid email address");
      return;
    }
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsSubscribed(true);
      showSuccessToast("Welcome to our newsletter! Check your email for exclusive offers.");
      setEmail("");
    } catch (err) {
      showErrorToast("Failed to subscribe. Please try again.");
    }
  }, [email]);

  return (
    <div>
      <h3 className={cn("text-base font-semibold mb-6", styles.mutedStrong)}>Stay Updated</h3>
      {!isSubscribed ? (
        <form onSubmit={handleNewsletterSubmit} className="w-full max-w-sm">
          <div className={cn(styles.glassPanel, "p-2")}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label htmlFor="newsletter-email" className="sr-only">Email address</label>
              <input id="newsletter-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" required className={cn("w-full sm:flex-1 bg-transparent px-4 py-3 text-sm sm:text-base text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 rounded-lg sm:rounded-l-lg sm:rounded-r-none", styles.focusRing)} />
              <button type="submit" className={cn("px-6 py-3 rounded-lg sm:rounded-r-lg sm:rounded-l-none font-medium w-full sm:w-auto text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-200", styles.focusRing)}>Subscribe</button>
            </div>
          </div>
          <p className={cn("text-xs mt-2 opacity-80", styles.mutedText)}>Get exclusive deals and early access to new releases.</p>
        </form>
      ) : (
        <div className={cn(styles.glassPanel, "p-6 text-center w-full max-w-sm")}>
          <Heart className="h-8 w-8 text-pink-500 mx-auto mb-3" aria-hidden="true" />
          <p className="text-sm sm:text-base font-medium text-emerald-500">Thanks for subscribing!</p>
          <p className={cn("mt-1 text-xs sm:text-sm", styles.mutedText)}>Check your email for a welcome gift.</p>
        </div>
      )}
    </div>
  );
});
Newsletter.displayName = "Newsletter";

const SocialLinks = memo(({ socials, enableAnimations }) => {
    const [hoveredSocial, setHoveredSocial] = useState(null);

    const handlePointerMove = useCallback((event, index) => {
        if (!enableAnimations) return;
        setHoveredSocial(index);
        const card = event.currentTarget;
        const rect = card.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty("--hover-x", `${x}%`);
        card.style.setProperty("--hover-y", `${y}%`);
    }, [enableAnimations]);

    const handlePointerLeave = useCallback((event) => {
        setHoveredSocial(null);
        if (!enableAnimations) return;
        event.currentTarget.style.removeProperty("--hover-x");
        event.currentTarget.style.removeProperty("--hover-y");
    }, [enableAnimations]);

    return (
        <div>
            <h4 className={cn("text-base font-medium mb-4", styles.mutedStrong)}>Follow Us</h4>
            <div className="grid grid-cols-5 gap-3" role="list" aria-label="Social media links">
                {socials.map((social, index) => (
                    <a key={index} href={social.href} className={cn(styles.glassPanel, "p-3 transition-all duration-300 group relative overflow-hidden", "ring-1 ring-slate-200/60 dark:ring-slate-800/70", styles.focusRing, hoveredSocial === index ? "ring-blue-400/50 shadow-lg shadow-blue-500/10" : "")} aria-label={`Follow us on ${social.name}`} target="_blank" rel="noopener noreferrer" role="listitem" onPointerMove={(e) => handlePointerMove(e, index)} onPointerLeave={handlePointerLeave}>
                        <div className="pointer-events-none absolute inset-0 transition-opacity duration-500" style={{ opacity: hoveredSocial === index ? 1 : 0, background: "radial-gradient(circle at var(--hover-x, 50%) var(--hover-y, 50%), rgba(59,130,246,0.35), transparent 65%)" }} aria-hidden="true" />
                        <social.icon className={cn("relative z-10 h-5 w-5 mx-auto transition-all duration-300", styles.mutedText, "group-hover:text-blue-500 group-hover:scale-110")} />
                        <div className={cn("relative z-10 mt-2 text-[0.65rem] font-medium", styles.mutedText, "group-hover:text-slate-900 dark:group-hover:text-white")}>{social.followers}</div>
                    </a>
                ))}
            </div>
        </div>
    );
});
SocialLinks.displayName = "SocialLinks";


const ScrollToTopButton = memo(() => {
    const scrollToTop = useCallback(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

    return (
        <button onClick={scrollToTop} className={cn(styles.glassPanel, "p-3 rounded-full transition-all duration-300 group self-center", "hover:bg-slate-100/70 dark:hover:bg-slate-800/70", styles.focusRing)} aria-label="Scroll to top of page">
            <ArrowUp className={cn("h-5 w-5 transition-all duration-300", styles.mutedText, "group-hover:text-blue-500 group-hover:-translate-y-1")} />
        </button>
    );
});
ScrollToTopButton.displayName = "ScrollToTopButton";

// --- MAIN FOOTER COMPONENT ---

const Footer = memo(() => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const enableAnimations = !prefersReducedMotion;
  const pulseClass = enableAnimations ? "animate-pulse" : "";
  const shimmerClass = enableAnimations ? "animate-gradient-shift" : "";
  const floatClass = enableAnimations ? "animate-float" : "";
  const footerRef = useRef(null);

  useEffect(() => {
    const footer = footerRef.current;
    if (!footer || !enableAnimations) return;

    const elements = Array.from(footer.querySelectorAll(".footer-animate-child"));
    elements.forEach(el => {
      el.style.opacity = "0";
      el.style.transform = "translateY(32px)";
    });

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry?.isIntersecting) return;
        elements.forEach((element, index) => {
          const delay = index * 100;
          element.style.transition = `opacity 600ms ease-out ${delay}ms, transform 600ms ease-out ${delay}ms`;
          element.style.opacity = "1";
          element.style.transform = "translateY(0)";
        });
        observer.disconnect();
      },
      { threshold: 0.1 }
    );
    observer.observe(footer);
    return () => observer.disconnect();
  }, [enableAnimations]);

  return (
    <footer ref={footerRef} className="relative bg-white text-slate-900 dark:bg-slate-950 dark:text-white overflow-hidden transition-colors duration-300" role="contentinfo" aria-label="Site footer">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-10" aria-hidden="true">
        <div className={cn("absolute top-0 left-0 w-64 h-64 rounded-full bg-blue-500/30 blur-3xl", pulseClass)} />
        <div className={cn("absolute bottom-0 right-0 w-96 h-96 rounded-full bg-purple-500/30 blur-3xl", pulseClass)} style={{ animationDelay: enableAnimations ? "1s" : undefined }} />
      </div>
      <div className="absolute inset-0 bg-white/40 dark:bg-slate-950/50 backdrop-blur-sm" aria-hidden="true" />

      <div className="relative z-10 container-app">
        <FeatureBar features={footerData.features} shimmerClass={shimmerClass} floatClass={floatClass} />

        <div className="py-12 footer-animate-child">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 xl:grid-cols-4">
            
            <div className="lg:col-span-1">
              <FooterInfo contact={footerData.contact} shimmerClass={shimmerClass} />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 lg:col-span-2 xl:col-span-2">
              <LinkSection title="Company" links={footerData.links.company} />
              <LinkSection title="Help" links={footerData.links.help} />
              <LinkSection title="Legal" links={footerData.links.legal} />
            </div>

            <div className="flex flex-col gap-6">
              <Newsletter />
              <SocialLinks socials={footerData.socials} enableAnimations={enableAnimations} />
            </div>

          </div>
        </div>

        <div className="py-6 border-t border-slate-200/60 dark:border-slate-800/70 flex flex-col-reverse gap-4 sm:flex-row sm:justify-between sm:items-center footer-animate-child">
          <p className={cn("text-xs text-center sm:text-left opacity-80", styles.mutedText)}>
            © {new Date().getFullYear()} ShoeMarkNet. All rights reserved. Made with <Heart className="inline h-3.5 w-3.5 text-pink-500 mx-0.5" aria-label="love" /> for sneaker lovers.
          </p>
          <ScrollToTopButton />
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = "Footer";

export default Footer;