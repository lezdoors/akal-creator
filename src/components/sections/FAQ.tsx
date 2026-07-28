import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const FAQS = [
  { q: 'Who is this for?', a: 'Brands spending $20K+ per month on paid media who want senior-level execution and measurable results. If you\'re tired of agencies that overpromise and underdeliver, we should talk.' },
  { q: 'What does engagement look like?', a: 'We start with a deep audit, then move into strategy and execution. You get direct access to the team running your campaigns — no layers, no junior associates.' },
  { q: 'How quickly will I see results?', a: 'Most clients see measurable improvements within 30–60 days. Significant performance shifts typically happen within the first quarter.' },
  { q: 'Do you require long-term contracts?', a: 'No. We work on a month-to-month basis. We keep clients because of results, not contracts.' },
  { q: 'What\'s the minimum ad spend?', a: 'We work best with brands investing $20K or more per month in paid media. This ensures enough volume to optimize effectively.' },
];

export const FAQ: React.FC = () => {
  return (
    <section id="faq" className="py-20 md:py-28 px-6 md:px-10">
      <div className="max-w-3xl mx-auto">
        <div className="mb-10">
          <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-3">Common Questions</p>
          <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-foreground">FAQ</h2>
        </div>

        <Accordion type="single" collapsible className="border-t border-border">
          {FAQS.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="border-b border-border">
              <AccordionTrigger className="text-foreground text-sm font-medium py-5 hover:no-underline">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-5">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};
