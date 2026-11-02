import { Icon } from "./Icons";

export default function EmptyState({ icon = "sparkles", title, description, action }) {
  return (
    <div className="empty-state">
      <span className="empty-state-icon" aria-hidden="true">
        <Icon name={icon} className="h-5 w-5" />
      </span>
      <h3 className="mt-4 text-base font-bold text-[var(--ink)]">{title}</h3>
      {description ? (
        <p className="mt-1.5 max-w-sm text-sm leading-6 text-[var(--ink-soft)]">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
