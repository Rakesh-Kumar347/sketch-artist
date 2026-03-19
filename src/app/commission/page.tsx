import CommissionForm from "@/components/CommissionForm";

export const metadata = {
  title: "Commission a Sketch — ArtFromHeart",
  description:
    "Upload your reference photo and get an instant AI-powered price estimate for your custom pencil sketch.",
};

export default function CommissionPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-stone-900">Commission a Sketch</h1>
        <p className="text-stone-500 mt-3 max-w-xl mx-auto">
          Upload your reference photo and get an instant price estimate based on
          the image complexity. No commitment required until you confirm.
        </p>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12 max-w-3xl mx-auto">
        {[
          { label: "Delivery Time", value: "7–21 days", sub: "Rush available" },
          { label: "Formats", value: "A5 to A2", sub: "Physical + scan" },
          { label: "Revision", value: "1 free revision", sub: "Per order" },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-white border border-stone-200 rounded-xl p-4 text-center"
          >
            <p className="text-xs text-stone-500 mb-1">{item.label}</p>
            <p className="font-bold text-stone-900">{item.value}</p>
            <p className="text-xs text-stone-400">{item.sub}</p>
          </div>
        ))}
      </div>

      <CommissionForm />
    </div>
  );
}
