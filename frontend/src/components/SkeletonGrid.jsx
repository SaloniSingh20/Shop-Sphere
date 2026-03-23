export function SkeletonGrid() {
  return (
    <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="overflow-hidden rounded-2xl border border-zinc-200 bg-white p-4">
          <div className="mb-4 h-36 animate-pulse rounded-xl bg-zinc-200" />
          <div className="h-4 animate-pulse rounded bg-zinc-200" />
          <div className="mt-3 h-4 w-3/4 animate-pulse rounded bg-zinc-200" />
          <div className="mt-6 h-9 animate-pulse rounded bg-zinc-200" />
        </div>
      ))}
    </div>
  );
}
