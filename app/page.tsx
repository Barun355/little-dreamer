import { Nav } from "@/components/sections/nav"
import { Footer } from "@/components/sections/footer"
import { Hero } from "@/components/sections/hero"
import { TrustBar } from "@/components/sections/trust-bar"
import { Core } from "@/components/sections/core"
import { Proof } from "@/components/sections/proof"
import { HowItWorks } from "@/components/sections/how-it-works"
import { Themes } from "@/components/sections/themes"
import { Sample } from "@/components/sections/sample"
import { Testimonials } from "@/components/sections/testimonials"
import { Pricing } from "@/components/sections/pricing"
import { Safety } from "@/components/sections/safety"
import { FinalCta } from "@/components/sections/final-cta"

/** The landing page — all 13 sections. */
export default function Page() {
  return (
    <>
      <Nav />

      <main id="main">
        <Hero />
        <TrustBar />
        <Core />
        <Proof />
        <HowItWorks />
        <Themes />
        <Sample />
        <Testimonials />
        <Pricing />
        <Safety />
        <FinalCta />
      </main>

      <Footer />
    </>
  )
}
