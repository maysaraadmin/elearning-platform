import { ReactNode, FormEvent } from 'react';
import { Button } from '../ui/Button';

interface FormActionsProps {
  onSubmit: (e: FormEvent) => void;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  isSubmitting?: boolean;
  isDirty?: boolean;
  children?: ReactNode;
}

export function FormActions({ onSubmit, onCancel, submitLabel = 'Save', cancelLabel = 'Cancel', isSubmitting, isDirty, children }: FormActionsProps) {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(e);
  };
  return (
    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
      {children}
      {onCancel && (
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          {cancelLabel}
        </Button>
      )}
      <Button type="submit" variant="primary" onClick={handleSubmit} isLoading={isSubmitting} disabled={!isDirty && !isSubmitting}>
        {submitLabel}
      </Button>
    </div>
  );
}