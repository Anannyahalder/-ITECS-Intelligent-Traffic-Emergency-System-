/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'dark';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variants = {
      default: 'bg-white border border-gray-200 shadow-sm',
      glass: 'bg-white/10 backdrop-blur-md border border-white/20 text-white',
      dark: 'bg-gray-900 border border-gray-800 text-white',
    };

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn('rounded-xl p-4', variants[variant], className)}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'danger' | 'warning' | 'success' | 'info';
  children: React.ReactNode;
  className?: string;
}

export const Badge = ({ className, variant = 'default', children, ...props }: BadgeProps) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    danger: 'bg-red-100 text-red-800',
    warning: 'bg-orange-100 text-orange-800',
    success: 'bg-green-100 text-green-800',
    info: 'bg-blue-100 text-blue-800',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
