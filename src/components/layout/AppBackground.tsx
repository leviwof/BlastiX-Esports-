/** Fixed, non-interactive atmospheric background: deep obsidian black base + electric mint ambient glow + esports grid. */
function AppBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background">
      {/* Deep obsidian base gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#080B10] via-[#0B1017] to-[#080B10]" />

      {/* Atmospheric electric mint neon glow, top-center */}
      <div className="absolute left-1/2 -top-48 h-[38rem] w-[54rem] -translate-x-1/2 rounded-full bg-primary/10 blur-[140px]" />

      {/* Deep cyan-teal spotlight, top-left */}
      <div className="absolute -left-32 top-1/4 h-[32rem] w-[32rem] rounded-full bg-[#00E5A3]/5 blur-[130px]" />

      {/* Free Fire championship amber accent glow, bottom-right */}
      <div className="absolute -right-32 bottom-10 h-[34rem] w-[34rem] rounded-full bg-gold/5 blur-[150px]" />

      {/* Faint technical cyber grid with smooth radial mask */}
      <div className="absolute inset-0 bg-tech-grid opacity-35 [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]" />

      {/* Subtle esports diagonal scanline texture */}
      <div className="absolute inset-0 bg-esports-stripes opacity-20 pointer-events-none" />

      {/* Vignette border frame to focus center stage */}
      <div className="absolute inset-0 [box-shadow:inset_0_0_120px_rgba(0,0,0,0.85)]" />
    </div>
  );
}

export { AppBackground };
