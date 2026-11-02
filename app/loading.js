export default function Loading() {
  return (
    <div className="page-container page-section" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading page…</span>

      <div className="page-head">
        <div className="page-head-grid">
          <div className="page-head-note">
            <div className="skeleton h-4 w-24" />
          </div>
          <div className="page-head-main">
            <div className="skeleton h-12 w-80 max-w-full" />
            <div className="skeleton mt-4 h-5 w-[34rem] max-w-full" />
          </div>
          <div className="hidden lg:block">
            <div className="skeleton h-9 w-32" />
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--rule-strong)]">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="grid gap-4 border-b border-[var(--rule)] py-5 sm:grid-cols-[4rem_minmax(0,1fr)_8rem] sm:items-center"
          >
            <div className="skeleton h-9 w-16" />
            <div>
              <div className="skeleton h-4 w-2/3 max-w-sm" />
              <div className="skeleton mt-2 h-3 w-1/2 max-w-xs" />
            </div>
            <div className="skeleton h-8 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}
