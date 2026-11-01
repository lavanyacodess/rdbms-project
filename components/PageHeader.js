import Link from "next/link";
import { Icon } from "./Icons";

export default function PageHeader({ eyebrow, title, description, actions, backHref, backLabel }) {
  return (
    <div className="mb-8">
      {backHref ? (
        <Link
          href={backHref}
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-brand-700"
        >
          <Icon name="arrowLeft" className="h-4 w-4" />
          {backLabel || "Back"}
        </Link>
      ) : null}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          {eyebrow ? <p className="section-eyebrow">{eyebrow}</p> : null}
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            {title}
          </h1>
          {description ? <p className="section-copy">{description}</p> : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}
