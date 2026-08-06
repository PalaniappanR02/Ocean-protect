import React from 'react';
import { motion } from 'framer-motion';
// Use `any` for report type to avoid tight coupling with types file
import { Clock, FileWarning } from 'lucide-react';
import { ReportCard } from '@/components/features/ReportCard';

interface VerificationQueueProps {
  reports?: { items: any[]; total?: number };
}

export const VerificationQueue: React.FC<VerificationQueueProps> = ({ reports }) => {
  const items = reports?.items || [];
  return (
    <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.45 }} className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Verification queue</h3>
        <div className="text-xs text-muted-foreground">{reports?.total || 0} awaiting</div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {items.length === 0 && <div className="py-8 text-center text-sm text-muted-foreground">No reports awaiting review</div>}
        {items.slice(0, 6).map((r) => (
          <motion.div whileHover={{ scale: 1.01 }} key={r.id} className="rounded-lg bg-gradient-to-r from-white/3 to-white/2 p-3 shadow-sm backdrop-blur-sm">
            <ReportCard report={r} />
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
};

export default VerificationQueue;
