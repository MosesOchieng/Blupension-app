interface BadgeProps {
  variant?: 'success' | 'error' | 'warning' | 'info';
  children: React.ReactNode;
  className?: string;
}

export default function Badge({ variant = 'info', children, className = '' }: BadgeProps) {
  const variants = {
    success: 'bg-success-light text-success-dark',
    error: 'bg-error-light text-error-dark',
    warning: 'bg-yellow-100 text-yellow-800',
    info: 'bg-primary-50 text-primary-700',
  };

  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
        ${variants[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
} 