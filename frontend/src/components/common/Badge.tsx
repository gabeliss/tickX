import { forwardRef, type HTMLAttributes } from 'react';
import { clsx } from 'clsx';
import styles from './Badge.module.css';

export type BadgeVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';
export type BadgeSize = 'sm' | 'md';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: React.ReactNode;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'default', size = 'md', icon, children, className, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={clsx(styles.badge, styles[variant], styles[size], className)}
        {...props}
      >
        {icon && <span className={styles.icon}>{icon}</span>}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export default Badge;
