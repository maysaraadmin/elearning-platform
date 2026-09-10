import { classNames } from '../../utils/helpers';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
}

export function Loading({ size = 'md', text, fullScreen = false }: LoadingProps) {
  const sizeStyles = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-4',
    lg: 'w-12 h-12 border-4',
  };

  const content = (
    <div className="flex flex-col items-center gap-3">
      <div
        className={classNames(
          'border-indigo-600 border-t-transparent rounded-full animate-spin',
          sizeStyles[size]
        )}
      />
      {text && <p className="text-sm text-gray-500">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 z-50 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return <div className="flex items-center justify-center py-12">{content}</div>;
}

export function LoadingOverlay({ isLoading, children, text }: { isLoading: boolean; children: React.ReactNode; text?: string }) {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-white/70 z-10 flex items-center justify-center">
          <Loading size="lg" text={text} />
        </div>
      )}
    </div>
  );
}