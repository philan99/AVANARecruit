import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoUrl from "@assets/GREEN_Color_logo_-_no_background_1777318447100.png";

export function SiteHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
        isScrolled
          ? "bg-[#1A2035]/95 backdrop-blur-md border-white/10 py-3"
          : "bg-[#1A2035] border-transparent py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <img 
            src={logoUrl} 
            alt="AVANA Services" 
            className="h-8 object-contain"
          />
          <span className="text-[#4CAF50] font-bold text-xl tracking-tight">.ai</span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <button onClick={() => scrollTo("services")} className="text-white/80 hover:text-white text-sm font-medium transition-colors">Services</button>
          <button onClick={() => scrollTo("approach")} className="text-white/80 hover:text-white text-sm font-medium transition-colors">Approach</button>
          <button onClick={() => scrollTo("faq")} className="text-white/80 hover:text-white text-sm font-medium transition-colors">FAQ</button>
        </nav>

        {/* Right CTA */}
        <div className="hidden md:block">
          <Button 
            onClick={() => scrollTo("contact")}
            className="bg-[#F5F0B0] text-[#1A2035] hover:bg-[#e6e1a1] font-semibold rounded-full px-6 transition-all border-none no-default-hover-elevate"
          >
            Partner With Us
          </Button>
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
          <button onClick={() => scrollTo("services")} className="text-left text-white/90 text-lg font-medium py-2 border-b border-white/5">Services</button>
          <button onClick={() => scrollTo("approach")} className="text-left text-white/90 text-lg font-medium py-2 border-b border-white/5">Approach</button>
          <button onClick={() => scrollTo("faq")} className="text-left text-white/90 text-lg font-medium py-2 border-b border-white/5">FAQ</button>
          <Button 
            onClick={() => scrollTo("contact")}
            className="w-full mt-4 bg-[#F5F0B0] text-[#1A2035] hover:bg-[#e6e1a1] font-semibold rounded-full border-none"
          >
            Partner With Us
          </Button>
        </div>
      )}
    </header>
  );
}
