import CommissionForm from "@/components/CommissionForm";

export const metadata = {
  title: "Commission a Portrait — Art From Heart",
  description:
    "Upload your reference photo and get an instant AI-powered price estimate for your custom pencil sketch.",
};

export default function CommissionPage() {
  return (
    <div className="bg-[#080808] min-h-screen pt-16">
      <div className="px-6 md:px-16 lg:px-24 py-20 max-w-7xl mx-auto">
        <p className="text-[#c9a96e] text-xs tracking-[0.5em] uppercase mb-4">Custom Work</p>
        <h1
          className="text-5xl md:text-7xl font-thin text-[#f0ece4] leading-tight mb-6"
          style={{ fontFamily: "var(--font-cormorant)", fontStyle: "italic" }}
        >
          Commission<br />
          <span className="text-[#c9a96e]">a Portrait</span>
        </h1>
        <p className="text-[#7a7570] text-sm mb-16 max-w-xl">
          Upload your reference photo and get an instant price estimate based on image complexity.
          No commitment required until you confirm.
        </p>

        {/* Info cards */}
        <div className="flex flex-row gap-3 mb-14 max-w-2xl">
          {[
            { label: "Delivery", value: "7–21 days", sub: "Rush available" },
            { label: "Formats",  value: "A5 to A2",   sub: "Physical + scan" },
            { label: "Revision", value: "1 included",  sub: "Per order" },
          ].map((item) => (
            <div
              key={item.label}
              className="flex-1 bg-[#1a1917] border border-[rgba(201,169,110,0.12)] p-4 text-center"
            >
              <p className="text-[10px] text-[#7a7570] tracking-[0.3em] uppercase mb-1">{item.label}</p>
              <p className="text-sm font-light text-[#f0ece4] mb-0.5">{item.value}</p>
              <p className="text-[10px] text-[#7a7570]">{item.sub}</p>
            </div>
          ))}
        </div>

        <CommissionForm />
      </div>
    </div>
  );
}
