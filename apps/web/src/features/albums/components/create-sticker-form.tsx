'use client';

import { type FormEvent, useMemo, useState } from 'react';

import type {
  AlbumSectionSummary,
  CreateStickerInput,
  StickerSummary
} from '@web/lib/api/api-types';
import { ApiError } from '@web/lib/api/http-client';

import { Field, SelectInput, TextInput } from './catalog-form-fields';
import { FormFeedback, getCatalogErrors } from './catalog-feedback';

interface CreateStickerFormProps {
  readonly isSubmitting: boolean;
  readonly nextSortOrder: number;
  readonly onCreateSticker: (
    input: CreateStickerInput
  ) => Promise<StickerSummary>;
  readonly sections: readonly AlbumSectionSummary[];
}

const getDuplicateCodeErrors = (
  error: unknown,
  normalizedCode: string
): readonly string[] => {
  if (error instanceof ApiError && error.status === 409) {
    return [
      `Sticker code ${normalizedCode} already exists in this album. Review the code or choose another one.`
    ];
  }

  return getCatalogErrors(error);
};

export function CreateStickerForm({
  isSubmitting,
  nextSortOrder,
  onCreateSticker,
  sections
}: CreateStickerFormProps) {
  const [sectionId, setSectionId] = useState(sections[0]?.id ?? '');
  const [code, setCode] = useState('');
  const [number, setNumber] = useState('');
  const [title, setTitle] = useState('');
  const [sortOrder, setSortOrder] = useState(String(nextSortOrder));
  const [errors, setErrors] = useState<readonly string[]>([]);
  const [successMessage, setSuccessMessage] = useState('');
  const normalizedCode = useMemo(() => code.trim().toUpperCase(), [code]);

  const resolvedSectionId = sectionId || sections[0]?.id || '';

  const validateForm = (): readonly string[] => [
    ...(resolvedSectionId.length > 0
      ? []
      : ['Create a section before adding stickers.']),
    ...(normalizedCode.length > 0 ? [] : ['Sticker code is required.']),
    ...(number.length === 0 ||
    (Number.isInteger(Number(number)) && Number(number) > 0)
      ? []
      : ['Sticker number must be a positive integer.']),
    ...(Number.isInteger(Number(sortOrder)) && Number(sortOrder) >= 0
      ? []
      : ['Sticker order must be a non-negative integer.'])
  ];

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
      const sticker = await onCreateSticker({
        sectionId: resolvedSectionId,
        code: normalizedCode,
        number: number.length > 0 ? Number(number) : null,
        title: title.trim().length > 0 ? title.trim() : null,
        sortOrder: Number(sortOrder)
      });

      setCode('');
      setNumber('');
      setTitle('');
      setSortOrder(String(sticker.sortOrder + 10));
      setSuccessMessage(`${sticker.code} was added.`);
    } catch (error) {
      setErrors(getDuplicateCodeErrors(error, normalizedCode));
    }
  };

  return (
    <form
      className="rounded-md border border-line bg-white p-5 shadow-sm"
      onSubmit={(event) => void handleSubmit(event)}
    >
      <div className="mb-5">
        <h2 className="text-lg font-semibold">Create sticker</h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          Codes are normalized to uppercase so they are easy to compare.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="md:col-span-2">
          <Field label="Section">
            <SelectInput
              value={resolvedSectionId}
              onChange={(event) => setSectionId(event.target.value)}
            >
              {sections.length === 0 ? (
                <option value="">No section available</option>
              ) : null}
              {sections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.code} - {section.name}
                </option>
              ))}
            </SelectInput>
          </Field>
        </div>

        <Field
          label="Sticker code"
          hint={normalizedCode ? `Preview: ${normalizedCode}` : undefined}
        >
          <TextInput
            autoComplete="off"
            placeholder="BRA01"
            value={code}
            onChange={(event) => setCode(event.target.value)}
          />
        </Field>

        <Field label="Order">
          <TextInput
            inputMode="numeric"
            min={0}
            type="number"
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value)}
          />
        </Field>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Field label="Number">
          <TextInput
            inputMode="numeric"
            min={1}
            type="number"
            value={number}
            onChange={(event) => setNumber(event.target.value)}
          />
        </Field>

        <Field label="Title">
          <TextInput
            autoComplete="off"
            placeholder="Team badge"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </Field>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <FormFeedback errors={errors} successMessage={successMessage} />
        <button
          type="submit"
          className="min-h-11 rounded-md bg-ocean px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-ocean focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={sections.length === 0 || isSubmitting}
        >
          {isSubmitting ? 'Creating...' : 'Create sticker'}
        </button>
      </div>
    </form>
  );
}
