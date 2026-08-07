import { cn } from '@/lib/utils';

interface KadalkavachLogoProps {
  className?: string;
  /** Sizes the inner SVG mark. */
  iconClassName?: string;
  /** Renders the wordmark next to the mark. */
  withWordmark?: boolean;
  wordmarkClassName?: string;
}

/**
 * Kadalkavach brand mark — a coastal shield formed by three ocean waves.
 * "Kadal" (sea) + "Kavach" (armour): the sea's shield.
 */
export function KadalkavachLogo({ className, iconClassName, withWordmark, wordmarkClassName }: KadalkavachLogoProps) {
  const showWordmark = withWordmark ?? Boolean(wordmarkClassName);
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <span className="grid place-items-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-teal-500/10 p-1.5 ring-1 ring-cyan-400/30">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn('h-5 w-5 text-cyan-400', iconClassName)} aria-hidden="true">
          {/* Shield */}
          <path
            d="M12 2.5 4.5 5.2v6.1c0 4.6 3.2 8 7.5 9.9 4.3-1.9 7.5-5.3 7.5-9.9V5.2L12 2.5Z"
            fill="currentColor"
            fillOpacity="0.12"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          {/* Three waves */}
          <path
            d="M6.8 10.2c.9-1.2 1.9-1.2 2.8 0s1.9 1.2 2.8 0 1.9-1.2 2.8 0 1.9 1.2 2.8 0"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
          <path
            d="M6.8 13.6c.9-1.2 1.9-1.2 2.8 0s1.9 1.2 2.8 0 1.9-1.2 2.8 0 1.9 1.2 2.8 0"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
          <path
            d="M6.8 17c.9-1.2 1.9-1.2 2.8 0s1.9 1.2 2.8 0 1.9-1.2 2.8 0 1.9 1.2 2.8 0"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            opacity="0.55"
          />
        </svg>
      </span>
      {showWordmark && (
        <span className={cn('font-semibold tracking-tight', wordmarkClassName)}>
          KADAL<span className="text-cyan-400">KAVACH</span>
        </span>
      )}
    </span>
  );
}

export default KadalkavachLogo;
