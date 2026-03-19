import PortfolioGallery from "@/components/PortfolioGallery";

export const metadata = {
  title: "Portfolio — ArtFromHeart",
  description: "Browse handcrafted pencil sketches — portraits, animals, landscapes and more.",
};

export default function PortfolioPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-stone-900">Portfolio</h1>
        <p className="text-stone-500 mt-3 max-w-xl mx-auto">
          A collection of handcrafted pencil sketches. Each piece is drawn with
          care and attention to detail.
        </p>
      </div>
      <PortfolioGallery />
    </div>
  );
}
