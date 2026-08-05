import React from 'react';
import { motion } from 'framer-motion';

interface ResourceProps {
  resource: any;
}

export const ResourceCard: React.FC<ResourceProps> = ({ resource }) => {
  return (
    <motion.div whileHover={{ translateY: -4 }} className="rounded-lg bg-gradient-to-br from-white/4 to-white/2 p-4 shadow-sm backdrop-blur-sm">
      <div className="flex items-start justify-between">
        <div>
          <div className="font-semibold">{resource.name}</div>
          <div className="mt-1 text-xs text-muted-foreground">{resource.type}</div>
        </div>
        <div className="text-right">
          <div className="text-lg font-semibold">{resource.available}/{resource.total}</div>
          <div className="text-xs text-muted-foreground">available</div>
        </div>
      </div>
    </motion.div>
  );
};

export default ResourceCard;
