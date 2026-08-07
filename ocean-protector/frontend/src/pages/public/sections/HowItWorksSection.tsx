import { motion, useReducedMotion } from 'framer-motion';
import { FileWarning, Sparkles, GitMerge, ShieldCheck, Radio } from 'lucide-react';
import { SectionHeading } from './SectionHeading';

const steps = [
  { icon: FileWarning, title: 'Citizen Report', body: 'A coastal hazard is reported with location, photos and description — online or fully offline.' },
  { icon: Sparkles, title: 'AI Enrichment', body: 'The classifier scores relevance, urgency and confidence in the region\u2019s own language.' },
  { icon: GitMerge, title: 'Correlation', body: 'Matching reports, sensor feeds and social signals are grouped into one coherent picture.' },
  { icon: ShieldCheck, title: 'Authority Review', body: 'Trained responders verify evidence. AI assists — it never decides alone.' },
  { icon: Radio, title: 'Alert & Response', body: 'Verified hazards become public alerts and dispatch the right response teams.' },
];

export function HowItWorksSection() {
  const reduceMotion = useReducedMotion();
  const item = {
    hidden: { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.2, 0.8, 0.2, 1] as const } },
  };

  return (
    <section className="border-y bg-muted/40 py-24 lg:py-32" aria-labelledby="how-it-works-heading">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          id="how-it-works-heading"
          eyebrow="How Kadalkavach works"
          title="From first signal to field response."
          description="A clear, auditable pipeline — every step logged, every decision attributable."
        />

        <ol className="mt-16 space-y-4">
          {steps.map(({ icon: Icon, title, body }, index) => (
            <motion.li
              key={title}
              initial={reduceMotion ? false : item.hidden}
              whileInView={reduceMotion ? undefined : item.visible}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
              className="group relative grid gap-4 rounded-2xl border bg-card p-6 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:gap-6 sm:p-7"
            >
              <div className="flex items-center gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-ocean-400/10 transition-colors group-hover:bg-ocean-400/20">
                  <Icon className="h-6 w-6 text-ocean-400" aria-hidden="true" />
                </span>
                <span className="font-mono text-xs text-muted-foreground">Step {String(index + 1).padStart(2, '0')}</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
                <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{body}</p>
              </div>
              <span aria-hidden="true" className="hidden font-mono text-2xl font-semibold text-ocean-400/20 sm:block">
                {String(index + 1).padStart(2, '0')}
              </span>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
