import { motion } from 'framer-motion';
import { Toast, ToastClose, ToastDescription, ToastIcon, ToastProgress, ToastProvider, ToastTitle, ToastViewport } from './toast';
import { useToast } from '@/hooks/useToast';

export function Toaster() {
  const { toasts } = useToast();
  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, variant, ...props }) => (
        <Toast key={id} variant={variant} {...props}>
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
            className="flex w-full items-start gap-3"
          >
            <ToastIcon variant={variant} />
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && <ToastDescription>{description}</ToastDescription>}
            </div>
          </motion.div>
          <ToastClose />
          <ToastProgress />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}