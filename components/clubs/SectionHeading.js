export default function SectionHeading({
  id,
  eyebrow,
  title,
  description,
  badge,
  badgeClass = "badge-slate",
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        {eyebrow ? <p className="section-eyebrow">{eyebrow}</p> : null}
        <h2
          id={id}
          className="mt-1 text-xl font-bold tracking-tight text-slate-950 sm:text-2xl"
        >
          {title}
        </h2>
        {description ? (
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">{description}</p>
        ) : null}
      </div>
      {badge ? <span className={badgeClass}>{badge}</span> : null}
    </div>
  );
}
