export default function PageIntro({
  eyebrow,
  title,
  description
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-4">
      <div className="inline-flex items-center rounded-full border border-slate-200 bg-white/85 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700 shadow-sm">
        {eyebrow}
      </div>
      <div className="space-y-3">
        <h1 className="text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">{title}</h1>
        <p className="max-w-4xl text-base leading-8 text-slate-600">{description}</p>
      </div>
    </div>
  );
}
