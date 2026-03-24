import PortfolioGallery from "@/components/PortfolioGallery";

export const metadata = {
  title: "Portfolio — Art From Heart",
  description: "Browse handcrafted pencil sketches — portraits, animals, landscapes and more.",
};

export default function PortfolioPage() {
  return (
    <div className="bg-[#080808] min-h-screen pt-16">
      <div className="px-6 md:px-16 lg:px-24 py-20 max-w-7xl mx-auto">
        <p className="text-[#c9a96e] text-xs tracking-[0.5em] uppercase mb-4">Works</p>
        <h1
          className="text-5xl md:text-7xl font-thin text-[#f0ece4] leading-tight mb-16"
          style={{ fontFamily: "var(--font-cormorant)", fontStyle: "italic" }}
        >
          Portfolio
        </h1>
        <PortfolioGallery />
      </div>
    </div>
  );
}
