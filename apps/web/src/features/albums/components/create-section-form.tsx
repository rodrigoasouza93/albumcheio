'use client';

import { type FormEvent, useMemo, useState } from 'react';

import type {
  AlbumSectionSummary,
  CreateAlbumSectionInput
} from '@web/lib/api/api-types';

import { Field, SelectInput, TextInput } from './catalog-form-fields';
import { FormFeedback, getCatalogErrors } from './catalog-feedback';

interface CreateSectionFormProps {
  readonly isDisabled: boolean;
  readonly isSubmitting: boolean;
  readonly nextSortOrder: number;
  readonly onCreateSection: (
    input: CreateAlbumSectionInput
  ) => Promise<AlbumSectionSummary>;
}

export function CreateSectionForm({
  isDisabled,
  isSubmitting,
  nextSortOrder,
  onCreateSection
}: CreateSectionFormProps) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [kind, setKind] = useState<AlbumSectionSummary['kind']>('team');
  const [sortOrder, setSortOrder] = useState(String(nextSortOrder));
  const [errors, setErrors] = useState<readonly string[]>([]);
  const [successMessage, setSuccessMessage] = useState('');

  const normalizedCode = useMemo(() => code.trim().toUpperCase(), [code]);

  const validateForm = (): readonly string[] => [
    ...(name.trim().length > 0 ? [] : ['Nome da seção é obrigatório.']),
    ...(normalizedCode.length > 0 ? [] : ['Código da seção é obrigatório.']),
    ...(Number.isInteger(Number(sortOrder)) && Number(sortOrder) >= 0
      ? []
      : ['A ordem da seção deve ser um número inteiro maior ou igual a zero.'])
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
      const section = await onCreateSection({
        name: name.trim(),
        code: normalizedCode,
        kind,
        sortOrder: Number(sortOrder)
      });

      setName('');
      setCode('');
      setKind('team');
      setSortOrder(String(section.sortOrder + 10));
      setSuccessMessage(`${section.name} foi adicionada.`);
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
        <h2 className="text-lg font-semibold">Criar seção</h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          Use códigos curtos que correspondam aos grupos impressos no álbum.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="md:col-span-2">
          <Field label="Nome da seção">
            <TextInput
              autoComplete="off"
              placeholder="Brasil"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </Field>
        </div>

        <Field
          label="Código da seção"
          hint={normalizedCode ? `Prévia: ${normalizedCode}` : undefined}
        >
          <TextInput
            autoComplete="off"
            placeholder="BRA"
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

      <div className="mt-4 max-w-xs">
        <Field label="Tipo">
          <SelectInput
            value={kind}
            onChange={(event) =>
              setKind(event.target.value as AlbumSectionSummary['kind'])
            }
          >
            <option value="team">Time</option>
            <option value="tournament">Torneio</option>
            <option value="custom">Personalizada</option>
          </SelectInput>
        </Field>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <FormFeedback errors={errors} successMessage={successMessage} />
        <button
          type="submit"
          className="min-h-11 rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-dark transition hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isDisabled || isSubmitting}
        >
          {isSubmitting ? 'Criando...' : 'Criar seção'}
        </button>
      </div>
    </form>
  );
}
