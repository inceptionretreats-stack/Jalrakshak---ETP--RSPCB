export function StaticHeroBackground({ clean = false }: { clean?: boolean }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0 transition-colors duration-1000"
        style={{
          background: clean
            ? "linear-gradient(180deg,#bfe6ff 0%,#7fcfe0 42%,#1d9ab6 70%,#073b50 100%)"
            : "linear-gradient(180deg,#3a3f24 0%,#2c3318 45%,#1f2a1a 72%,#0e1410 100%)",
        }}
      />
      {/* sun / haze */}
      <div
        className="absolute left-1/2 top-[18%] h-64 w-64 -translate-x-1/2 rounded-full blur-3xl transition-opacity duration-1000"
        style={{ background: "radial-gradient(circle, rgba(255,240,200,0.7), transparent 70%)", opacity: clean ? 0.9 : 0.25 }}
      />
      {/* layered waves */}
      <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 320" preserveAspectRatio="none" style={{ height: "46%" }}>
        <path
          fill={clean ? "#0e7490" : "#243018"}
          fillOpacity="0.7"
          d="M0,160 C240,220 480,100 720,140 C960,180 1200,260 1440,180 L1440,320 L0,320 Z"
        />
        <path
          fill={clean ? "#155e75" : "#1a2412"}
          fillOpacity="0.85"
          d="M0,220 C240,180 480,260 720,220 C960,180 1200,240 1440,210 L1440,320 L0,320 Z"
        />
      </svg>
    </div>
  );
}
