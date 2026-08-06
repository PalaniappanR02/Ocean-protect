import React from 'react';
import { motion } from 'framer-motion';
import { Activity, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

interface AnalystHeroProps {
  title?: string;
  subtitle?: string;
  totalIncidents?: number;
  verificationQueue?: number;
}

export const AnalystHero: React.FC<AnalystHeroProps> = ({
  title = 'Operational Command — Analyst',
  subtitle = 'Track incidents, prioritise verification, and coordinate response',
  totalIncidents = 0,
  verificationQueue = 0,
}) => {
  return (
    <motion.header
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-sky-800/60 via-cyan-700/40 to-indigo-900/40 p-6 shadow-lg backdrop-blur-md"
      aria-labelledby="analyst-hero-title"
    >
      <div className="absolute inset-0 -z-10 opacity-40" aria-hidden>
        <div className="pointer-events-none h-full w-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-indigo-600/30 to-transparent" />
      </div>

      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 id="analyst-hero-title" className="text-3xl font-bold leading-tight text-white">
            {title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-cyan-100/90">{subtitle}</p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-3 rounded-lg bg-white/6 px-4 py-2 text-sm text-white">
              <Activity className="h-5 w-5 text-white/90" />
              <div>
                <div className="text-xs text-white/80">Active incidents</div>
                <div className="text-lg font-semibold">{totalIncidents}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg bg-white/6 px-4 py-2 text-sm text-white">
              <Clock className="h-5 w-5 text-white/90" />
              <div>
                <div className="text-xs text-white/80">Verification queue</div>
                <div className="text-lg font-semibold">{verificationQueue}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg bg-white/6 px-4 py-2 text-sm text-white">
              <CheckCircle className="h-5 w-5 text-white/90" />
              <div>
                <div className="text-xs text-white/80">Verified today</div>
                <div className="text-lg font-semibold">—</div>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden items-center gap-4 md:flex">
          <div className="rounded-full bg-white/6 p-3 text-white">
            <AlertTriangle className="h-6 w-6" />
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default AnalystHero;
