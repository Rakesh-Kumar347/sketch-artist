import OrdersLookup from "@/components/OrdersLookup";

export const metadata = {
  title: "My Orders — Art From Heart",
  description: "Track your commission orders and view their current status.",
};

export default function OrdersPage() {
  return (
    <div className="bg-[#080808] min-h-screen pt-16">
      <div className="px-6 md:px-16 lg:px-24 py-20 max-w-7xl mx-auto">
        <p className="text-[#c9a96e] text-xs tracking-[0.5em] uppercase mb-4 text-center">
          Order Tracking
        </p>
        <h1
          className="text-5xl md:text-7xl font-thin text-[#f0ece4] leading-tight mb-6 text-center"
          style={{ fontFamily: "var(--font-cormorant)", fontStyle: "italic" }}
        >
          My Orders
        </h1>
        <p className="text-[#7a7570] text-sm mb-16 max-w-xl mx-auto text-center">
          Track the status of your commissions and cancel pending orders if needed.
        </p>

        <OrdersLookup />
      </div>
    </div>
  );
}
