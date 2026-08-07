import { motion, useReducedMotion } from 'framer-motion';
import { Waves } from 'lucide-react';
import { TrustSection } from './sections/TrustSection';

export function AboutPage() {
  const reduceMotion = useReducedMotion();
  return (
    <>
      <section className="relative overflow-hidden py-24 lg:py-32" aria-labelledby="about-heading">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <img
            src="https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1600&q=60"
            alt=""
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover opacity-[0.10]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ocean-400/5 to-transparent" />
        </div>
        <div className="relative mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-ocean-400">About Kadalkavach</p>
            <h1 id="about-heading" className="mt-5 text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-[1.06] tracking-[-0.035em]">
              The coast is shared.
              <br />
              So is the picture of it.
            </h1>
          </motion.div>

          <div className="mt-10 space-y-6 text-base leading-7 text-muted-foreground">
            <motion.p
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Kadalkavach is a coastal safety system for South India&rsquo;s shoreline communities. It
              joins the evidence people collect with what sensors measure and what public channels
              report, then helps authorities separate signal from noise — fast enough to matter.
            </motion.p>
            <motion.p
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.18 }}
            >
              Built for the four coastal states of Tamil Nadu, Kerala, Karnataka and Andhra Pradesh,
              it speaks the region&rsquo;s languages, works without a connection, and treats every
              report as evidence a human responder will ultimately judge.
            </motion.p>
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.26 }}
              className="flex items-center gap-3 rounded-2xl border bg-card p-5"
            >
              <Waves className="h-6 w-6 shrink-0 text-ocean-400" aria-hidden="true" />
              <p className="text-sm leading-6 text-muted-foreground">
                <span className="font-semibold text-foreground">Our operating rule:</span> AI assists
                analysis, authorities make decisions, and public information is always verified
                before it is shared.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
      <TrustSection />
    </>
  );
}
