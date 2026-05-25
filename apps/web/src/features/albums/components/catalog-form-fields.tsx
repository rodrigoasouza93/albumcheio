'use client';

import type { ChangeEventHandler, ReactNode } from 'react';

const fieldClassName =
  'min-h-11 rounded-md border border-line px-3 text-base font-normal text-ink outline-none transition focus:border-ocean focus:ring-2 focus:ring-ocean/20';

const textAreaClassName =
  'min-h-24 rounded-md border border-line px-3 py-2 text-base font-normal leading-6 text-ink outline-none transition focus:border-ocean focus:ring-2 focus:ring-ocean/20';

interface FieldProps {
  readonly children: ReactNode;
  readonly hint?: string;
  readonly label: string;
}

export function Field({ children, hint, label }: FieldProps) {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium text-ink">
      <span>{label}</span>
      {children}
      {hint ? (
        <span className="text-xs font-normal text-slate-500">{hint}</span>
      ) : null}
    </label>
  );
}

interface TextInputProps {
  readonly autoComplete?: string;
  readonly inputMode?: 'numeric' | 'text';
  readonly min?: number;
  readonly onChange: ChangeEventHandler<HTMLInputElement>;
  readonly placeholder?: string;
  readonly type?: 'number' | 'text';
  readonly value: string;
}

export function TextInput({
  autoComplete,
  inputMode,
  min,
  onChange,
  placeholder,
  type = 'text',
  value
}: TextInputProps) {
  return (
    <input
      className={fieldClassName}
      autoComplete={autoComplete}
      inputMode={inputMode}
      min={min}
      placeholder={placeholder}
      type={type}
      value={value}
      onChange={onChange}
    />
  );
}

interface TextAreaProps {
  readonly onChange: ChangeEventHandler<HTMLTextAreaElement>;
  readonly placeholder?: string;
  readonly value: string;
}

export function TextArea({ onChange, placeholder, value }: TextAreaProps) {
  return (
    <textarea
      className={textAreaClassName}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  );
}

interface SelectInputProps {
  readonly children: ReactNode;
  readonly onChange: ChangeEventHandler<HTMLSelectElement>;
  readonly value: string;
}

export function SelectInput({ children, onChange, value }: SelectInputProps) {
  return (
    <select className={fieldClassName} value={value} onChange={onChange}>
      {children}
    </select>
  );
}
