import { LandingCta } from "./landing-cta"
import { LandingFooter } from "./landing-footer"
import { LandingHero } from "./landing-hero"
import { LandingNav } from "./landing-nav"
import { LandingPersonalization } from "./landing-personalization"
import { LandingSteps } from "./landing-steps"
import { LandingThemes } from "./landing-themes"
import { LandingWhatsInside } from "./landing-whats-inside"

export function LandingPage() {
  return (
    <div className="min-h-svh bg-[#07070f] text-white">
      <LandingNav />
      <main>
        <LandingHero />
        <LandingSteps />
        <LandingPersonalization />
        <LandingThemes />
        <LandingWhatsInside />
        <LandingCta />
      </main>
      <LandingFooter />
    </div>
  )
}
