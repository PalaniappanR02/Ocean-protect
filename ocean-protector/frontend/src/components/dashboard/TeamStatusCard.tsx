import React from 'react';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';

interface TeamProps {
  team: any;
}

export const TeamStatusCard: React.FC<TeamProps> = ({ team }) => {
  return (
    <motion.div whileHover={{ translateY: -4 }} className="rounded-lg bg-gradient-to-br from-white/4 to-white/2 p-4 shadow-sm backdrop-blur-sm">
      <div className="flex items-start gap-3">
        <div className="rounded-md bg-white/6 p-2 text-white"><Users className="h-6 w-6" /></div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <div className="font-semibold">{team.name}</div>
            <div className={`text-xs font-medium ${team.status === 'available' ? 'text-green-400' : 'text-amber-400'}`}>{team.status}</div>
          </div>
          <div className="mt-1 text-sm text-muted-foreground">{team.assignment || 'No assignment'}</div>
          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
            <div>{team.personnel || 0} personnel</div>
            <div>{team.vehicles || 0} vehicles</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TeamStatusCard;
