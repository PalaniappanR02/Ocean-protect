import { SignalGapSection } from './sections/SignalGapSection';
import { HowItWorksSection } from './sections/HowItWorksSection';
import { CapabilitiesSection } from './sections/CapabilitiesSection';

export function HowItWorksPage() {
  return (
    <>
      <SignalGapSection />
      <HowItWorksSection />
      <CapabilitiesSection />
    </>
  );
}
