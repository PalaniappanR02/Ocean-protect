import React from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, Users, Activity } from 'lucide-react';

interface Props {
  activeIncidents?: number;
  teamsDeployed?: number;
  criticalAlerts?: number;
  readiness?: number;
}

export const AuthorityHero: React.FC<Props> = ({ activeIncidents = 0, teamsDeployed = 0, criticalAlerts = 0, readiness = 84 }) => {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative rounded-2xl bg-gradient-to-br from-rose-700/50 via-orange-700/30 to-yellow-600/20 p-6 shadow-lg backdrop-blur-md">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-white">Emergency Command Center</h2>
          <p className="mt-1 text-sm text-white/90">Operational readiness and incident command</p>

          <div className="mt-4 flex flex-wrap gap-3">
            <div className="flex items-center gap-3 rounded-lg bg-white/6 px-4 py-2 text-white">
              <Activity className="h-5 w-5" />
              <div>
                <div className="text-xs text-white/80">Active incidents</div>
                <div className="text-lg font-semibold">{activeIncidents}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg bg-white/6 px-4 py-2 text-white">
              <Users className="h-5 w-5" />
              <div>
                <div className="text-xs text-white/80">Teams deployed</div>
                <div className="text-lg font-semibold">{teamsDeployed}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg bg-white/6 px-4 py-2 text-white">
              <AlertTriangle className="h-5 w-5" />
              <div>
                <div className="text-xs text-white/80">Critical alerts</div>
                <div className="text-lg font-semibold">{criticalAlerts}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-3">
          <div className="rounded-lg bg-white/6 px-4 py-2 text-white">
            <div className="text-xs">Operational readiness</div>
            <div className="text-xl font-semibold">{readiness}%</div>
          </div>
          <div className="rounded-full bg-white/8 p-3 text-white">
            <Shield className="h-6 w-6" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AuthorityHero;
