import { motion, useReducedMotion } from 'framer-motion';
import { FileWarning, WifiOff, Languages, Radio, Map, ShieldCheck } from 'lucide-react';
import { SectionHeading } from './SectionHeading';

const capabilities = [
  {
    icon: FileWarning,
    title: 'Citizen reporting',
    body: 'Report a hazard in under a minute with GPS location, photos and a clear tracking ID to follow.',
  },
  {
    icon: WifiOff,
    title: 'Offline-first evidence',
    body: 'Draft reports and capture photos with no signal — everything syncs safely when you reconnect.',
  },
  {
    icon: Languages,
    title: 'Regional languages',
    body: 'The classifier understands Tamil, Malayalam, Kannada and Telugu, not just English.',
  },
  {
    icon: Radio,
    title: 'Social intelligence',
    body: 'Public coastal signals are screened for relevance and urgency before they reach analysts.',
  },
  {
    icon: Map,
    title: 'Hotspots',
    body: 'Correlated events surface as hotspots so authorities see where attention is needed most.',
  },
  {
    icon: ShieldCheck,
    title: 'Authority verification',
    body: 'Trained responders verify and publish — the final decision always stays with the authority.',
  },
];

export function CapabilitiesSection() {
  const reduceMotion = useReducedMotion();
  const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
  const item = {
    hidden: { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.2, 0.8, 0.2, 1] as const } },
  };

  return (
    <section className="py-24 lg:py-32" id="capabilities" aria-labelledby="capabilities-heading">
      <SectionHeading
        id="capabilities-heading"
        eyebrow="Capabilities"
        title="Built for the shoreline, by design."
        description="Every capability exists because a coastal community needed it — not because it was easy to build."
      />

      <motion.div
        variants={reduceMotion ? undefined : stagger}
        initial={reduceMotion ? false : 'hidden'}
        whileInView={reduceMotion ? undefined : 'visible'}
        viewport={{ once: true, margin: '-80px' }}
        className="mx-auto mt-16 grid w-full max-w-6xl gap-5 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 lg:px-8"
      >
        {capabilities.map(({ icon: Icon, title, body }) => (
          <motion.article
            key={title}
            variants={item}
            className="group relative overflow-hidden rounded-2xl border bg-card p-7 transition-all hover:-translate-y-1 hover:shadow-md"
          >
            <span className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-ocean-400/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" aria-hidden="true" />
            <span className="grid h-11 w-11 place-items-center rounded-lg bg-ocean-400/10">
              <Icon className="h-5 w-5 text-ocean-400" aria-hidden="true" />
            </span>
            <h3 className="mt-5 text-base font-semibold tracking-tight">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
          </motion.article>
        ))}
      </motion.div>
    </section>
  );
}
