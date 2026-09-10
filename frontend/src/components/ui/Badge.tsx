import { ReactNode } from 'react';
import { classNames } from '../../utils/helpers';
import { getStatusColor } from '../../utils/helpers';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'status';
  size?: 'sm' | 'md';
  status?: string;
}

export function Badge({ children, variant = 'default', size = 'md', status }: BadgeProps) {
  const variantStyles = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    status: status ? `bg-opacity-10 text-opacity-90` : 'bg-gray-100 text-gray-800',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };

  let style = variantStyles[variant];
  if (variant === 'status' && status) {
    const color = getStatusColor(status);
    style = `bg-[${color}]/10 text-[${color}]`;
  }

  return (
    <span
      className={classNames(
        'inline-flex items-center font-medium rounded-full',
        style,
        sizeStyles[size]
      )}
    >
      {children}
    </span>
  );
}