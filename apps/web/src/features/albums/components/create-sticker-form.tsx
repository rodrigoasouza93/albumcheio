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
      `O código ${normalizedCode} já existe neste álbum. Revise o código ou escolha outro.`
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
      : ['Crie uma seção antes de adicionar figurinhas.']),
    ...(normalizedCode.length > 0
      ? []
      : ['Código da figurinha é obrigatório.']),
    ...(number.length === 0 ||
    (Number.isInteger(Number(number)) && Number(number) > 0)
      ? []
      : ['O número da figurinha deve ser um número inteiro positivo.']),
    ...(Number.isInteger(Number(sortOrder)) && Number(sortOrder) >= 0
      ? []
      : [
          'A ordem da figurinha deve ser um número inteiro maior ou igual a zero.'
        ])
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
      setSuccessMessage(`${sticker.code} foi adicionada.`);
    } catch (error) {
      setErrors(getDuplicateCodeErrors(error, normalizedCode));
    }
  };

  return (
    <form
      className="rounded-xl border border-line bg-white p-5"
      onSubmit={(event) => void handleSubmit(event)}
    >
      <div className="mb-5">
        <h2 className="text-lg font-semibold">Criar figurinha</h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          Os códigos são convertidos para maiúsculas para facilitar a
          comparação.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="md:col-span-2">
          <Field label="Seção">
            <SelectInput
              value={resolvedSectionId}
              onChange={(event) => setSectionId(event.target.value)}
            >
              {sections.length === 0 ? (
                <option value="">Nenhuma seção disponível</option>
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
          label="Código da figurinha"
          hint={normalizedCode ? `Prévia: ${normalizedCode}` : undefined}
        >
          <TextInput
            autoComplete="off"
            placeholder="BRA01"
            value={code}
            onChange={(event) => setCode(event.target.value)}
          />
        </Field>

        <Field label="Ordem">
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
        <Field label="Número">
          <TextInput
            inputMode="numeric"
            min={1}
            type="number"
            value={number}
            onChange={(event) => setNumber(event.target.value)}
          />
        </Field>

        <Field label="Título">
          <TextInput
            autoComplete="off"
            placeholder="Escudo do time"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </Field>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <FormFeedback errors={errors} successMessage={successMessage} />
        <button
          type="submit"
          className="min-h-11 rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-dark transition hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={sections.length === 0 || isSubmitting}
        >
          {isSubmitting ? 'Criando...' : 'Criar figurinha'}
        </button>
      </div>
    </form>
  );
}
