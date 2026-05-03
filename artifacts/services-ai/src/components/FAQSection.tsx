import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function FAQSection() {
  const faqs = [
    {
      q: "How do the four AVANA platforms work together?",
      a: "Each AVANA platform is fully usable on its own, but they're designed to compound. AVANA Recruit's Hired stage hands new hires straight to AVANA Onboard. AVANA Docs sits on top of every contract, policy and job spec produced along the way. AVANA Insights then unifies the data from all three so leadership can ask plain-English questions across the entire workforce lifecycle."
    },
    {
      q: "Can I use a single AVANA platform on its own?",
      a: "Yes. Every AVANA platform ships as a standalone enterprise product with its own login, billing and data model. Use just AVANA Recruit today and add the others when you're ready."
    },
    {
      q: "Can we integrate AVANA with our existing ERP/CRM?",
      a: "Yes. AVANA Insights ships with pre-built connectors to HubSpot, Salesforce, Xero, Shopify, Sheets, PostgreSQL and more, and we provide a documented API for custom integrations into your existing ERP, HRIS or CRM."
    },
    {
      q: "How do you handle data privacy and model training?",
      a: "Your organisational data is siloed per-tenant, encrypted in transit and at rest, and is never used to train generalised public models. We are SOC2-aligned and operate UK-region data residency by default."
    }
  ];

  return (
    <section id="faq" className="py-24" style={{ backgroundColor: "#f3f5f8" }}>
      <div className="max-w-3xl mx-auto px-6 lg:px-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-[40px] font-bold leading-tight mb-4" style={{ color: "#1a2035" }}>
            Frequently Asked Questions
          </h2>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-[#1a2035]/10">
              <AccordionTrigger className="text-left text-lg font-semibold hover:text-[#4CAF50] hover:no-underline transition-colors py-6" style={{ color: "#1a2035" }}>
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-base leading-relaxed pb-6" style={{ color: "#4b5563" }}>
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
