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
        <h1 className="text-4xl font-bold text-[var(--text)]">Commission a Sketch</h1>
        <p className="text-[var(--text-muted)] mt-3 max-w-xl mx-auto">
          Upload your reference photo and get an instant price estimate based on
          the image complexity. No commitment required until you confirm.
        </p>
      </div>

      {/* Info cards */}
      <div className="flex flex-row gap-2 sm:gap-4 mb-12 max-w-3xl mx-auto" style={{ display: "flex", flexDirection: "row" }}>
        {[
          { label: "Delivery Time", value: "7–21 days", sub: "Rush available" },
          { label: "Formats", value: "A5 to A2", sub: "Physical + scan" },
          { label: "Revision", value: "1 free revision", sub: "Per order" },
        ].map((item) => (
          <div
            key={item.label}
            className="flex-1 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-2 sm:p-4 text-center"
          >
            <p className="text-[10px] sm:text-xs text-[var(--text-muted)] mb-1">{item.label}</p>
            <p className="text-xs sm:text-base font-bold text-[var(--text)]">{item.value}</p>
            <p className="text-[10px] sm:text-xs text-[var(--text-muted)]">{item.sub}</p>
          </div>
        ))}
      </div>

      <CommissionForm />
    </div>
  );
}
