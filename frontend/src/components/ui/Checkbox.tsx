import { ButtonHTMLAttributes, forwardRef } from 'react';
import { classNames } from '../../utils/helpers';

interface CheckboxProps extends ButtonHTMLAttributes<HTMLInputElement> {
  label: string;
  description?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, className, id, ...props }, ref) => {
    const checkboxId = id || label.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex items-start gap-3">
        <input
          ref={ref}
          type="checkbox"
          id={checkboxId}
          className={classNames(
            'mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600',
            'focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            className
          )}
          {...props}
        />
        <div>
          <label htmlFor={checkboxId} className="text-sm font-medium text-gray-700 cursor-pointer">
            {label}
          </label>
          {description && <p className="text-sm text-gray-500">{description}</p>}
        </div>
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';