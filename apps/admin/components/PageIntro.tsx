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
    <div className="space-y-3">
      <p className="text-sm font-semibold text-blue-700">{eyebrow}</p>
      <h1 className="text-3xl font-semibold text-slate-950 md:text-4xl">{title}</h1>
      <p className="max-w-3xl text-sm leading-7 text-slate-600 md:text-base">{description}</p>
    </div>
  );
}
