export default function Loading() {
  return (
    <div className="page-container page-section">
      <div className="space-y-4">
        <div className="skeleton h-4 w-28" />
        <div className="skeleton h-10 w-80 max-w-full" />
        <div className="skeleton h-5 w-[34rem] max-w-full" />
      </div>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="card space-y-4 p-6">
            <div className="skeleton h-11 w-11" />
            <div className="skeleton h-5 w-2/3" />
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-5/6" />
            <div className="skeleton h-9 w-28" />
          </div>
        ))}
      </div>
    </div>
  );
}
