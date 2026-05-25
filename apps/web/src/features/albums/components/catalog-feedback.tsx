'use client';

interface FormFeedbackProps {
  readonly errors: readonly string[];
  readonly successMessage: string;
}

export function FormFeedback({ errors, successMessage }: FormFeedbackProps) {
  if (errors.length > 0) {
    return (
      <div
        className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
        role="alert"
      >
        <p className="font-semibold">Check the form</p>
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
        className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800"
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

  return ['Something went wrong. Please try again.'];
};
