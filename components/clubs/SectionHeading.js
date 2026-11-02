export default function SectionHeading({
  id,
  eyebrow,
  title,
  description,
  badge,
  badgeClass = "badge-slate",
}) {
  return (
    <div className="section-head">
      {eyebrow ? (
        <div className="section-head-note hidden lg:block">
          <span className="margin-label">{eyebrow}</span>
        </div>
      ) : null}
      <div className="section-head-main">
        <div className="section-head-title-row">
          <h2 id={id} className="section-title">
            {title}
          </h2>
          {badge ? <span className={badgeClass}>{badge}</span> : null}
        </div>
        {description ? <p className="section-copy">{description}</p> : null}
      </div>
    </div>
  );
}
