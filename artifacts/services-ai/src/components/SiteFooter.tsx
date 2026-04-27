import logoUrl from "@assets/GREEN_Color_logo_-_no_background_1777318447100.png";

export function SiteFooter() {
  return (
    <footer className="bg-[#1a2035] border-t border-white/10 py-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 flex flex-col md:flex-row items-center justify-between gap-6">
        
        <div className="cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="relative inline-block">
            <img 
              src={logoUrl} 
              alt="AVANA Services" 
              className="h-6 object-contain opacity-90 block"
            />
            <span className="absolute bottom-[1px] -right-[15px] text-[#4CAF50] text-xs tracking-tight leading-none">.ai</span>
          </div>
        </div>

        <div className="text-white/40 text-sm">
          © 2026 AVANA Services. All rights reserved.
        </div>

        <div className="flex items-center gap-6 text-sm text-white/40">
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">Terms</a>
        </div>

      </div>
    </footer>
  );
}
