import Preloader from "@/components/sections/Preloader";
import Hero from "@/components/sections/Hero";
import Marquee from "@/components/sections/Marquee";
import Gallery from "@/components/sections/Gallery";
import About from "@/components/sections/About";
import Process from "@/components/sections/Process";
import CommissionSection from "@/components/sections/CommissionSection";
import Testimonials from "@/components/sections/Testimonials";
import PortfolioFooter from "@/components/sections/PortfolioFooter";

export default function HomePage() {
  return (
    <div className="portfolio-page bg-[#080808] min-h-screen">
      <Preloader />
      <Hero />
      <Marquee />
      <Gallery />
      <About />
      <Process />
      <CommissionSection />
      <Testimonials />
      <PortfolioFooter />
    </div>
  );
}
