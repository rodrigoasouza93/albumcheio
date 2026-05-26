'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { AuthForm } from './auth-form';
import { useSession } from '../hooks/session-context';

export function AuthPage() {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/albums');
    }
  }, [router, status]);

  return (
    <main className="min-h-screen bg-paper px-4 py-8 text-ink sm:px-6 lg:px-8">
      <section className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center gap-8 lg:grid-cols-[1fr_28rem]">
        <div className="max-w-2xl">
          <Image
            priority
            className="mb-8 h-auto w-48 sm:w-56"
            src="/logo.png"
            alt="Álbum Cheio"
            width={1024}
            height={1024}
          />
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ocean">
            Álbum Cheio
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-normal text-dark sm:text-5xl">
            Seu álbum de figurinhas sempre atualizado.
          </h1>
          <p className="mt-5 text-base leading-7 text-slate-700">
            Entre para ver seus álbuns cadastrados, abrir detalhes e manter os
            dados da coleção vinculados à sua conta.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              'Dados privados',
              'Catálogo do álbum',
              'Acesso rápido no celular'
            ].map((item) => (
              <div
                key={item}
                className="rounded-xl border border-line bg-white px-4 py-3 text-sm font-semibold text-slate-700"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        {status === 'loading' ? (
          <div
            className="rounded-xl border border-line bg-white p-6 text-sm text-slate-700"
            role="status"
          >
            Verificando sua sessão...
          </div>
        ) : (
          <AuthForm />
        )}
      </section>
    </main>
  );
}
