import React from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { AnimatedCount } from './AnimatedCount';
import { SparklinePlaceholder } from './SparklinePlaceholder';

interface DashboardCardProps {
  label: string;
  value: number;
  subtitle?: string;
  trend?: string;
  progress?: number; // 0-100
  Icon?: LucideIcon;
  className?: string;
}

export function DashboardCard({ label, value, subtitle, trend, progress = 0, Icon, className = '' }: DashboardCardProps) {
  return (
    <motion.div whileHover={{ y: -6 }} whileTap={{ scale: 0.995 }} className={`transform-gpu ${className}`}>
      <Card className="overflow-hidden rounded-2xl bg-gradient-to-br from-white/30 to-white/10 border border-transparent p-0">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
              <div className="mt-2 flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-oceanBlue text-white shadow-md">
                    {Icon ? <Icon className="h-6 w-6" aria-hidden /> : null}
                  </div>
                  <div>
                    <div className="text-2xl font-semibold leading-none text-ink"><AnimatedCount value={value} /></div>
                    {subtitle && <div className="text-sm text-muted-foreground">{subtitle}</div>}
                  </div>
                </div>
                <div className="ml-auto text-right">
                  {trend && <div className="text-sm font-medium text-muted-foreground">{trend}</div>}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-2 w-36 overflow-hidden rounded-full bg-muted">
                <div className="h-2 rounded-full bg-gradient-to-r from-primary to-oceanBlue" style={{ width: `${Math.max(4, Math.min(100, progress))}%` }} />
              </div>
              <SparklinePlaceholder />
            </div>
            <div className="text-xs text-muted-foreground">Updated</div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
