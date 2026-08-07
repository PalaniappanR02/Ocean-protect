import { motion, useReducedMotion } from 'framer-motion';
import { Radar, Eye, Users, Plus } from 'lucide-react';
import { SectionHeading } from './SectionHeading';

const pillars = [
  {
    number: '01',
    icon: Radar,
    title: 'Sensor intelligence',
    body: 'Wave buoys, tide gauges and forecast feeds continuously measure the state of the sea.',
  },
  {
    number: '02',
    icon: Eye,
    title: 'Human eyewitness evidence',
    body: 'People on the shore see what instruments miss — photos, locations and descriptions, even offline.',
  },
  {
    number: '03',
    icon: Users,
    title: 'Public digital signals',
    body: 'Coastal chatter on social platforms carries early warnings that formal channels have not caught yet.',
  },
];

export function SignalGapSection() {
  const reduceMotion = useReducedMotion();
  const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12 } },
  };
  const item = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.2, 0.8, 0.2, 1] as const } },
  };

  return (
    <section className="py-24 lg:py-32" aria-labelledby="signal-gap-heading">
      <SectionHeading
        id="signal-gap-heading"
        eyebrow="The signal gap"
        title={
          <>
            No single source sees
            <br />
            the whole coast.
          </>
        }
        description="Coastal hazards rarely announce themselves through one channel. Kadalkavach fuses the three signals that matter — so nothing important is missed."
      />

      <motion.div
        variants={reduceMotion ? undefined : stagger}
        initial={reduceMotion ? false : 'hidden'}
        whileInView={reduceMotion ? undefined : 'visible'}
        viewport={{ once: true, margin: '-80px' }}
        className="mx-auto mt-16 grid w-full max-w-6xl gap-5 px-4 sm:px-6 lg:grid-cols-3 lg:px-8"
      >
        {pillars.map(({ number, icon: Icon, title, body }) => (
          <motion.article
            key={number}
            variants={item}
            className="group relative overflow-hidden rounded-2xl border bg-card p-7 transition-shadow hover:shadow-md"
          >
            <span className="font-mono text-xs text-ocean-400">{number}</span>
            <span className="mt-6 grid h-12 w-12 place-items-center rounded-xl bg-ocean-400/10 transition-transform duration-300 group-hover:-translate-y-0.5">
              <Icon className="h-6 w-6 text-ocean-400" aria-hidden="true" />
            </span>
            <h3 className="mt-5 text-lg font-semibold tracking-tight">{title}</h3>
            <p className="mt-2.5 text-sm leading-6 text-muted-foreground">{body}</p>
          </motion.article>
        ))}
      </motion.div>

      <motion.p
        initial={reduceMotion ? false : { opacity: 0 }}
        whileInView={reduceMotion ? undefined : { opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mx-auto mt-10 flex max-w-3xl items-center justify-center gap-3 px-4 text-sm text-muted-foreground"
      >
        <Plus className="h-4 w-4 text-ocean-400" aria-hidden="true" />
        <span>
          Each signal alone is incomplete. Together they form the evidence trail an authority can act on.
        </span>
        <Plus className="h-4 w-4 text-ocean-400" aria-hidden="true" />
      </motion.p>
    </section>
  );
}
