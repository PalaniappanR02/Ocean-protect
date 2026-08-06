import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.2, 0.8, 0.2, 1] }}
      className={cn(
        'glass-panel-soft relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border-dashed p-8 text-center sm:p-12',
        className
      )}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(14,116,144,0.10),transparent_45%)]" />
      <div className="relative mb-4 grid h-14 w-14 place-items-center rounded-full border border-white/30 bg-white/50 shadow-sm">
        <Icon className="h-7 w-7 text-slate-500" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-600">{description}</p>
      )}
      {action && <div className="relative mt-5">{action}</div>}
    </motion.div>
  );
}
