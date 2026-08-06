import React from 'react';
import { motion } from 'framer-motion';
import { Waves, FileWarning, Map, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CitizenHero() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-ocean-400/20 to-cyan-100/10 p-6"
      aria-labelledby="hero-title"
    >
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-cyan-100/10 to-transparent opacity-60" aria-hidden />
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 id="hero-title" className="text-3xl font-bold tracking-tight">Protect Our Oceans</h1>
          <p className="mt-2 text-sm text-muted-foreground">Monitor hazards, report incidents and stay informed.</p>

          <div className="mt-4 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <a href="/citizen/report">
                <FileWarning className="mr-2 h-4 w-4" />
                Report Hazard
              </a>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="/citizen/map">
                <Map className="mr-2 h-4 w-4" />
                View Map
              </a>
            </Button>
            <Button asChild variant="ghost" size="lg">
              <a href="/citizen/alerts">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Safety Alerts
              </a>
            </Button>
          </div>
        </div>

        <div className="mt-4 lg:mt-0 flex items-center gap-4">
          <div className="rounded-full bg-white/30 p-3 backdrop-blur-md">
            <Waves className="h-8 w-8 text-primary" aria-hidden />
          </div>
          <div className="hidden sm:block text-sm text-muted-foreground">Keeping coastal communities safe — live updates and volunteer coordination.</div>
        </div>
      </div>
    </motion.section>
  );
}
