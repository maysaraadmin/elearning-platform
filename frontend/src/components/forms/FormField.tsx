import { ReactNode } from 'react';
import { classNames } from '../../utils/helpers';

interface FormFieldProps {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export function FormField({ label, error, helperText, required, children, className }: FormFieldProps) {
  return (
    <div className={classNames('w-full', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
        </label>
      )}
      {children}
      {error && <p className="mt-1 text-sm text-red-600" role="alert">{error}</p>}
      {helperText && !error && <p className="mt-1 text-sm text-gray-500">{helperText}</p>}
    </div>
  );
}

export function FormSection({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <fieldset className="space-y-4">
      <legend className="text-lg font-medium text-gray-900">{title}</legend>
      {description && <p className="text-sm text-gray-500">{description}</p>}
      <div className="space-y-4">{children}</div>
    </fieldset>
  );
}

export function FormRow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={classNames('grid grid-cols-1 md:grid-cols-2 gap-4', className)}>
      {children}
    </div>
  );
}