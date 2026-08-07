import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { FileWarning, Search, Radio, ArrowRight, Radar, Eye, Users } from 'lucide-react';
import { KadalkavachLogo } from '@/components/brand/KadalkavachLogo';

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.2, 0.8, 0.2, 1] as const } },
};

const signalStack = [
  { number: '01', label: 'Sensor intelligence', icon: Radar },
  { number: '02', label: 'Eyewitness evidence', icon: Eye },
  { number: '03', label: 'Public digital signals', icon: Users },
];

export function LandingHero() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="landing-hero relative overflow-hidden" aria-labelledby="hero-heading">
      {/* Deep ocean backdrop */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 bg-[#03141f]" />
        <img
          src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=60"
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover opacity-[0.16]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#03141f]/70 via-[#03141f]/40 to-[#03141f]" />
        <div className="absolute -left-40 top-[-10%] h-[34rem] w-[34rem] rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute -right-32 bottom-[-20%] h-[30rem] w-[30rem] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
      </div>

      {/* Wave line art */}
      <svg
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40 w-full text-cyan-300/10 landing-wave"
        viewBox="0 0 1440 160"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0,80 C180,20 360,140 540,80 C720,20 900,140 1080,80 C1260,20 1350,90 1440,60 L1440,160 L0,160 Z"
          fill="currentColor"
        />
      </svg>

      <div className="relative mx-auto grid w-full max-w-7xl gap-14 px-4 pb-24 pt-14 sm:px-6 lg:grid-cols-[1.25fr_0.75fr] lg:items-center lg:px-8 lg:pb-32 lg:pt-20">
        <motion.div
          className="lg:col-span-2"
          initial={reduceMotion ? false : { opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <Link to="/" aria-label="Kadalkavach home">
            <KadalkavachLogo iconClassName="h-7 w-7" withWordmark wordmarkClassName="text-lg font-semibold tracking-tight text-white" />
          </Link>
        </motion.div>
        <motion.div
          variants={reduceMotion ? undefined : container}
          initial={reduceMotion ? false : 'hidden'}
          animate="visible"
        >
          <motion.p
            variants={item}
            className="font-mono text-[11px] uppercase tracking-[0.22em] text-cyan-300/80"
          >
            Kadalkavach · South India coastal safety
          </motion.p>

          <motion.h1
            id="hero-heading"
            variants={item}
            className="landing-display mt-6 text-[clamp(2.6rem,6.5vw,5.2rem)] font-semibold leading-[1.02] tracking-[-0.04em] text-white"
          >
            Ocean intelligence,
            <br />
            <span className="text-cyan-300">from shoreline</span>
            <br />
            to response.
          </motion.h1>

          <motion.p variants={item} className="mt-7 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
            One shared picture of the coast — built from citizen reports, sensor
            data and public signals, enriched by AI and decided by authorities.
          </motion.p>

          <motion.div variants={item} className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              to="/citizen/report"
              className="button-primary inline-flex h-12 items-center gap-2 rounded-xl px-6 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#03141f]"
            >
              <FileWarning className="h-4 w-4" aria-hidden="true" />
              Report a Hazard
            </Link>
            <Link
              to="/track"
              className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
              Track Report
            </Link>
            <Link
              to="/public-alerts"
              className="inline-flex h-12 items-center gap-2 rounded-xl px-5 text-sm font-medium text-slate-300 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
            >
              <Radio className="h-4 w-4" aria-hidden="true" />
              View Public Alerts
            </Link>
            <Link
              to="/login"
              className="inline-flex h-12 items-center gap-2 rounded-xl px-4 text-sm font-medium text-slate-300 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
            >
              Sign In
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </motion.div>
        </motion.div>

        {/* Signal stack */}
        <motion.aside
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
          className="relative"
          aria-label="Signal sources"
        >
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm sm:p-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400">
              What the coast tells us
            </p>
            <ul className="mt-6 space-y-5">
              {signalStack.map(({ number, label, icon: Icon }, index) => (
                <motion.li
                  key={number}
                  initial={reduceMotion ? false : { opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.35 + index * 0.12, ease: [0.2, 0.8, 0.2, 1] }}
                  className="flex items-center gap-4"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/5">
                    <Icon className="h-5 w-5 text-cyan-300" aria-hidden="true" />
                  </span>
                  <span className="font-mono text-[11px] text-slate-500">{number}</span>
                  <span className="text-[15px] font-medium text-slate-100">{label}</span>
                </motion.li>
              ))}
            </ul>
            <div className="mt-7 border-t border-white/10 pt-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-cyan-300/70">
                Correlated in real time
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Matching evidence across sources so one true picture reaches the right responder.
              </p>
            </div>
          </div>
        </motion.aside>
      </div>

      {/* Facts strip */}
      <div className="relative border-t border-white/10">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-6 px-4 py-8 sm:px-6 md:grid-cols-4 lg:px-8">
          {[
            ['4', 'coastal states covered'],
            ['5', 'regional languages'],
            ['24/7', 'monitoring & response loop'],
            ['3', 'evidence sources fused'],
          ].map(([value, label]) => (
            <div key={label} className="flex flex-col gap-1">
              <span className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">{value}</span>
              <span className="text-xs uppercase tracking-[0.14em] text-slate-400">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
