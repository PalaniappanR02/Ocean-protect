import { LandingHero } from './sections/LandingHero';
import { SignalGapSection } from './sections/SignalGapSection';
import { HowItWorksSection } from './sections/HowItWorksSection';
import { CapabilitiesSection } from './sections/CapabilitiesSection';
import { TrustSection } from './sections/TrustSection';
import { AlertsPreviewSection } from './sections/AlertsPreviewSection';

/**
 * Immersive public landing page. Editorial maritime identity, no map hero,
 * restrained motion. Rendered only for unauthenticated visitors; signed-in
 * users are routed straight to their role workspace.
 */
export function LandingPage() {
  return (
    <>
      <LandingHero />
      <SignalGapSection />
      <HowItWorksSection />
      <CapabilitiesSection />
      <TrustSection />
      <AlertsPreviewSection />
    </>
  );
}
