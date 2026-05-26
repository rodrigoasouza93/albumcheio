const readinessItems = [
  'Next.js App Router',
  'Limite da API NestJS',
  'Testes básicos com Vitest',
  'Base E2E com Playwright'
] as const;

export function HomeSummary() {
  return (
    <main className="min-h-screen bg-paper px-6 py-10 text-ink">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-10">
        <div className="flex flex-col gap-4 border-b border-line pb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ocean">
            Gestão de álbuns de figurinhas
          </p>
          <h1 className="text-4xl font-bold tracking-normal text-dark sm:text-5xl">
            Álbum Cheio
          </h1>
          <p className="max-w-2xl text-base leading-7 text-slate-700">
            Base pronta para catálogo de álbuns, coleção de figurinhas e fluxos
            de usuário autenticado.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {readinessItems.map((item) => (
            <div
              key={item}
              className="rounded-xl border border-line bg-white px-4 py-3 text-sm font-medium"
            >
              {item}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
