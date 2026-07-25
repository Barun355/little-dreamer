import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { faq } from "@/content/conversion"

/**
 * Section 11 — Safety / FAQ.
 *
 * Ordered by the objections competitor research found parents actually raise:
 * photo handling first, likeness second. Content comes from content/conversion
 * and is the same source the FAQPage structured data will read, so the visible
 * copy and the markup cannot drift apart.
 */
export function Safety() {
  return (
    <section id="safety" aria-labelledby="safety-heading" className="py-20 sm:py-28">
      <div className="mx-auto flex max-w-3xl flex-col gap-8 px-5 sm:px-8">
        <h2
          id="safety-heading"
          className="text-center font-heading text-h1 font-semibold text-balance"
        >
          {faq.heading}
        </h2>

        <Accordion defaultValue={[faq.items[0].id]} className="w-full">
          {faq.items.map((item) => (
            <AccordionItem key={item.id} value={item.id}>
              <AccordionTrigger className="text-left font-heading text-body-lg font-semibold">
                {item.q}
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-body text-muted-foreground text-pretty">{item.a}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
