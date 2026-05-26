'use client';

import { type FormEvent, useState } from 'react';

import type { AlbumSummary } from '@web/lib/api/api-types';
import { Field, TextArea, TextInput } from './catalog-form-fields';
import { FormFeedback, getCatalogErrors } from './catalog-feedback';

interface CreateAlbumFormProps {
  readonly isSubmitting: boolean;
  readonly onCreateAlbum: (input: {
    readonly name: string;
    readonly edition: string | null;
    readonly description: string | null;
  }) => Promise<AlbumSummary>;
}

const mapOptionalText = (value: string): string | null => {
  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : null;
};

export function CreateAlbumForm({
  isSubmitting,
  onCreateAlbum
}: CreateAlbumFormProps) {
  const [name, setName] = useState('');
  const [edition, setEdition] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<readonly string[]>([]);
  const [successMessage, setSuccessMessage] = useState('');

  const validateForm = (): readonly string[] =>
    name.trim().length > 0 ? [] : ['Nome do álbum é obrigatório.'];

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors = validateForm();

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setSuccessMessage('');
      return;
    }

    setErrors([]);
    setSuccessMessage('');

    try {
      const album = await onCreateAlbum({
        name: name.trim(),
        edition: mapOptionalText(edition),
        description: mapOptionalText(description)
      });

      setName('');
      setEdition('');
      setDescription('');
      setSuccessMessage(`${album.name} foi criado.`);
    } catch (error) {
      setErrors(getCatalogErrors(error));
    }
  };

  return (
    <form
      className="rounded-xl border border-line bg-white p-5"
      onSubmit={(event) => void handleSubmit(event)}
    >
      <div className="mb-5">
        <h2 className="text-lg font-semibold">Criar álbum</h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          Cadastre o catálogo básico antes de adicionar seções e figurinhas.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Nome do álbum">
          <TextInput
            autoComplete="off"
            placeholder="Copa do Mundo 2026"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </Field>

        <Field label="Edição">
          <TextInput
            autoComplete="off"
            placeholder="Panini"
            value={edition}
            onChange={(event) => setEdition(event.target.value)}
          />
        </Field>
      </div>

      <div className="mt-4">
        <Field label="Descrição">
          <TextArea
            placeholder="Álbum principal do torneio"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </Field>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <FormFeedback errors={errors} successMessage={successMessage} />
        <button
          type="submit"
          className="min-h-11 rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-dark transition hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Criando...' : 'Criar álbum'}
        </button>
      </div>
    </form>
  );
}
