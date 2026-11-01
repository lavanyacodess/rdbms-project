import { Icon } from "./Icons";

export default function EmptyState({ icon = "sparkles", title, description, action }) {
  return (
    <div className="empty-state">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
        <Icon name={icon} className="h-6 w-6" />
      </span>
      <h3 className="mt-4 text-base font-bold text-slate-900">{title}</h3>
      {description ? (
        <p className="mt-1.5 max-w-sm text-sm leading-6 text-slate-500">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
