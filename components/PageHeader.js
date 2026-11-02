import Link from "next/link";
import { Icon } from "./Icons";

export default function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  backHref,
  backLabel,
}) {
  return (
    <header className="page-head">
      {backHref ? (
        <Link href={backHref} className="back-link">
          <Icon name="arrowLeft" className="h-3.5 w-3.5" />
          {backLabel || "Back"}
        </Link>
      ) : null}
      <div className="page-head-grid">
        <div className="page-head-note hidden lg:block">
          {eyebrow ? <span className="file-tab">{eyebrow}</span> : null}
        </div>
        <div className="page-head-main">
          <h1 className="page-title">{title}</h1>
          {description ? <p className="page-lede">{description}</p> : null}
        </div>
        {actions ? <div className="page-head-actions">{actions}</div> : null}
      </div>
    </header>
  );
}
