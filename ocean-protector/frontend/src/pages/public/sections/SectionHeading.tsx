import { motion, useReducedMotion } from 'framer-motion';

interface SectionHeadingProps {
  eyebrow: string;
  title: React.ReactNode;
  description?: string;
  id?: string;
}

export function SectionHeading({ eyebrow, title, description, id }: SectionHeadingProps) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      id={id}
      className="mx-auto max-w-2xl text-center"
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
    >
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-ocean-400">{eyebrow}</p>
      <h2 className="mt-4 text-[clamp(1.9rem,4vw,3rem)] font-semibold leading-[1.08] tracking-[-0.03em]">
        {title}
      </h2>
      {description && <p className="mt-5 text-base leading-7 text-muted-foreground">{description}</p>}
    </motion.div>
  );
}
