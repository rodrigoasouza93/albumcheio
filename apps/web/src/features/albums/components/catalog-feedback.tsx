'use client';

interface FormFeedbackProps {
  readonly errors: readonly string[];
  readonly successMessage: string;
}

export function FormFeedback({ errors, successMessage }: FormFeedbackProps) {
  if (errors.length > 0) {
    return (
      <div
        className="rounded-xl border border-danger bg-danger px-3 py-2 text-sm text-white"
        role="alert"
      >
        <p className="font-semibold">Revise o formulário</p>
        <ul className="mt-1 list-disc pl-5">
          {errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      </div>
    );
  }

  if (successMessage.length > 0) {
    return (
      <p
        className="rounded-xl border border-ocean bg-ocean px-3 py-2 text-sm font-medium text-white"
        role="status"
      >
        {successMessage}
      </p>
    );
  }

  return null;
}

export const getCatalogErrors = (error: unknown): readonly string[] => {
  if (error instanceof Error && 'details' in error) {
    const details = (error as { readonly details?: unknown }).details;

    if (Array.isArray(details)) {
      return details.filter(
        (detail): detail is string => typeof detail === 'string'
      );
    }
  }

  if (error instanceof Error) {
    return [error.message];
  }

  return ['Algo deu errado. Tente novamente.'];
};
