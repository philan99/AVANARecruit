import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoUrl from "@assets/GREEN_Color_logo_-_no_background_1777318447100.png";

export function SiteHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location, setLocation] = useLocation();

  const handleLogoClick = (e: React.MouseEvent) => {
    if (location === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      e.preventDefault();
      setLocation("/");
      window.scrollTo({ top: 0 });
    }
  };

  const handlePortfolioClick = (e: React.MouseEvent) => {
    setMobileMenuOpen(false);
    if (location === "/") {
      e.preventDefault();
      document.getElementById("services")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-4 ${
        isScrolled
          ? "bg-[#1A2035]/95 backdrop-blur-md"
          : "bg-[#1A2035]"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-between">
        {/* Logo */}
        <a
          href="/services-ai/"
          onClick={handleLogoClick}
          aria-label="AVANA Services — Home"
          className="cursor-pointer inline-block"
          data-testid="site-logo"
        >
          <div className="relative inline-block">
            <img 
              src={logoUrl} 
              alt="AVANA Services" 
              className="h-10 object-contain block"
            />
            <span className="absolute bottom-[1px] -right-[14px] text-[#4CAF50] text-sm tracking-tight leading-none">.ai</span>
          </div>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <a href="/services-ai/#services" onClick={handlePortfolioClick} className="text-white/80 hover:text-white text-sm font-medium transition-colors">Portfolio</a>
          <button onClick={() => scrollTo("faq")} className="text-white/80 hover:text-white text-sm font-medium transition-colors">FAQ</button>
          <a href="/services-ai/contact-us" className="text-white/80 hover:text-white text-sm font-medium transition-colors">Contact Us</a>
        </nav>

        {/* Right CTA */}
        <div className="hidden md:block">
          <a href="/services-ai/contact-us">
            <Button
              className="bg-[#4CAF50] text-white hover:bg-[#43a047] font-semibold rounded-md px-6 transition-all border-none no-default-hover-elevate"
            >
              Partner With Us
            </Button>
          </a>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden text-white p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-[#1A2035] border-b border-white/10 p-6 flex flex-col gap-4 shadow-xl">
          <a href="/services-ai/#services" onClick={handlePortfolioClick} className="text-left text-white/90 text-lg font-medium py-2 border-b border-white/5">Portfolio</a>
          <button onClick={() => scrollTo("faq")} className="text-left text-white/90 text-lg font-medium py-2 border-b border-white/5">FAQ</button>
          <a href="/services-ai/contact-us" className="text-left text-white/90 text-lg font-medium py-2 border-b border-white/5">Contact Us</a>
          <a href="/services-ai/contact-us" className="block mt-4">
            <Button
              className="w-full bg-[#4CAF50] text-white hover:bg-[#43a047] font-semibold rounded-md border-none"
            >
              Partner With Us
            </Button>
          </a>
        </div>
      )}
    </header>
  );
}
