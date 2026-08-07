import { motion, useReducedMotion } from 'framer-motion';
import { Bot, Scale, Lock, EyeOff } from 'lucide-react';
import { SectionHeading } from './SectionHeading';

const statements = [
  {
    icon: Bot,
    title: 'AI assists, it does not verify',
    body: 'Machine learning scores and enriches. Verification is a human, accountable act.',
  },
  {
    icon: Scale,
    title: 'Authority decides',
    body: 'Response teams remain the final decision-makers on every incident, start to finish.',
  },
  {
    icon: Lock,
    title: 'Private evidence is protected',
    body: 'Reporter identity and sensitive evidence are held on secure infrastructure, not public feeds.',
  },
  {
    icon: EyeOff,
    title: 'Public views carry safe data',
    body: 'Only verified, sanitized information reaches the public — no raw reports, no personal details.',
  },
];

export function TrustSection() {
  const reduceMotion = useReducedMotion();
  const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };
  const item = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.2, 0.8, 0.2, 1] as const } },
  };

  return (
    <section className="border-y bg-muted/40 py-24 lg:py-32" id="trust" aria-labelledby="trust-heading">
      <SectionHeading
        id="trust-heading"
        eyebrow="Trust & safety"
        title="Responsible by construction."
        description="Speed matters in a coastal emergency. So does the discipline that keeps every decision honest."
      />

      <motion.div
        variants={reduceMotion ? undefined : stagger}
        initial={reduceMotion ? false : 'hidden'}
        whileInView={reduceMotion ? undefined : 'visible'}
        viewport={{ once: true, margin: '-80px' }}
        className="mx-auto mt-16 grid w-full max-w-6xl gap-5 px-4 sm:grid-cols-2 sm:px-6 lg:px-8"
      >
        {statements.map(({ icon: Icon, title, body }) => (
          <motion.article
            key={title}
            variants={item}
            className="flex gap-5 rounded-2xl border bg-card p-7"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-ocean-400/10">
              <Icon className="h-5 w-5 text-ocean-400" aria-hidden="true" />
            </span>
            <div>
              <h3 className="text-base font-semibold tracking-tight">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
            </div>
          </motion.article>
        ))}
      </motion.div>
    </section>
  );
}
