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
    name.trim().length > 0 ? [] : ['Album name is required.'];

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
      setSuccessMessage(`${album.name} was created.`);
    } catch (error) {
      setErrors(getCatalogErrors(error));
    }
  };

  return (
    <form
      className="rounded-md border border-line bg-white p-5 shadow-sm"
      onSubmit={(event) => void handleSubmit(event)}
    >
      <div className="mb-5">
        <h2 className="text-lg font-semibold">Create album</h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          Register the basic catalog before adding sections and stickers.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Album name">
          <TextInput
            autoComplete="off"
            placeholder="World Cup 2026"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </Field>

        <Field label="Edition">
          <TextInput
            autoComplete="off"
            placeholder="Panini"
            value={edition}
            onChange={(event) => setEdition(event.target.value)}
          />
        </Field>
      </div>

      <div className="mt-4">
        <Field label="Description">
          <TextArea
            placeholder="Main tournament album"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </Field>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <FormFeedback errors={errors} successMessage={successMessage} />
        <button
          type="submit"
          className="min-h-11 rounded-md bg-ocean px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-ocean focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating...' : 'Create album'}
        </button>
      </div>
    </form>
  );
}
