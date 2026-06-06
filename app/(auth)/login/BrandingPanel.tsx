export default function BrandingPanel() {
  return (
    <div className="hidden lg:flex lg:w-1/2 bg-orange-500 flex-col justify-between p-12 relative overflow-hidden">
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-orange-400 rounded-full opacity-50" />
      <div className="absolute top-1/3 -right-16 w-56 h-56 bg-orange-600 rounded-full opacity-30" />
      <div className="absolute -bottom-16 left-1/4 w-64 h-64 bg-orange-300 rounded-full opacity-40" />

      <div className="relative z-10 flex items-center gap-3">
        <div className="w-11 h-11 bg-white/25 rounded-2xl flex items-center justify-center backdrop-blur-sm">
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 2h1a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H3zM7 13H3M12 2v20M17 7l5-5M22 7c0 4-4.5 5-6 2.5"
            />
          </svg>
        </div>
        <div>
          <p className="text-white font-bold text-lg leading-tight">
            Toriniku Geprek
          </p>
          <p className="text-orange-100 text-sm">POS System</p>
        </div>
      </div>

      <div className="relative z-10">
        <h2 className="text-white text-4xl font-bold leading-tight mb-4">
          Kelola warungmu
          <br />
          dengan mudah 🍗
        </h2>
        <p className="text-orange-100 text-base leading-relaxed max-w-sm">
          Pantau pesanan, kelola menu, dan lacak keuntungan harianmu semua
          dalam satu tempat.
        </p>
        <div className="flex flex-wrap gap-2 mt-8">
          {[
            "📦 Manajemen Pesanan",
            "🍽️ Kelola Menu",
            "📊 Laporan Laba",
            "⚡ Real-time",
          ].map((f) => (
            <span
              key={f}
              className="bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-white/20"
            >
              {f}
            </span>
          ))}
        </div>
      </div>

      <div className="relative z-10">
        <p className="text-orange-200 text-xs">
          © 2026 Toriniku Geprek · All rights reserved
        </p>
      </div>
    </div>
  );
}
