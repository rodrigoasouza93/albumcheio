const readinessItems = [
  'Next.js App Router',
  'NestJS API boundary',
  'Vitest smoke tests',
  'Playwright E2E shell'
] as const;

export function HomeSummary() {
  return (
    <main className="min-h-screen bg-paper px-6 py-10 text-ink">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-10">
        <div className="flex flex-col gap-4 border-b border-line pb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ocean">
            Sticker album management
          </p>
          <h1 className="text-4xl font-semibold tracking-normal sm:text-5xl">
            AlbumCheio
          </h1>
          <p className="max-w-2xl text-base leading-7 text-slate-700">
            Base workspace ready for album catalog, sticker collection and
            authenticated user flows.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {readinessItems.map((item) => (
            <div
              key={item}
              className="rounded-md border border-line bg-white px-4 py-3 text-sm font-medium shadow-sm"
            >
              {item}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
