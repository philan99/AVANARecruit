import { useEffect } from "react";
import { LegalLayout } from "@/components/legal-layout";

export default function Terms() {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <LegalLayout>
      <div className="max-w-3xl mx-auto px-6 lg:px-10 pt-16 pb-20">
        <h1 className="text-3xl lg:text-4xl font-bold mb-2" style={{ color: "#1a2035" }}>Terms and Conditions</h1>
        <p className="text-sm mb-10" style={{ color: "#6b7280" }}>Last updated: April 2026</p>

        <div className="space-y-8 text-sm leading-relaxed" style={{ color: "#374151" }}>
          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "#1a2035" }}>1. Introduction</h2>
            <p>
              These Terms and Conditions ("Terms") govern your use of the AVANA Suite of platforms (each a "Platform" and together the "Platforms"), operated by AVANA Services Limited, a company registered in England and Wales (Company Number: 15268633) ("AVANA", "we", "us", "our").
            </p>
            <p className="mt-3">
              The AVANA Suite currently comprises AVANA Recruit (AI-powered talent matching), AVANA Onboard (AI-powered employee onboarding), AVANA Docs (AI document and knowledge assistant) and AVANA Insights (AI data consolidation), together with the parent AVANA Services site. These Terms apply to your use of any of them, except where additional terms are presented for a specific Platform or feature.
            </p>
            <p className="mt-3">
              By accessing or using any Platform, you agree to be bound by these Terms. If you do not agree to these Terms, you must not use the Platforms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "#1a2035" }}>2. Definitions</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>"Platform" / "Platforms"</strong> means any one or more of the AVANA Suite products listed above, including any associated websites, applications, APIs and dashboards.</li>
              <li><strong>"User"</strong> means any individual or organisation that accesses or uses a Platform, whether as a registered account holder or an unauthenticated visitor.</li>
              <li><strong>"Customer"</strong> means an organisation that has subscribed to or otherwise procured access to a Platform.</li>
              <li><strong>"Services"</strong> means the products, features, functionality and content made available through the Platforms, including AI-generated outputs, integrations, dashboards and reports.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "#1a2035" }}>3. Account Registration</h2>
            <p>To use certain features of the Platforms, you must create an account. You agree to:</p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>Provide accurate, current, and complete information during registration.</li>
              <li>Maintain and promptly update your account information to keep it accurate and complete.</li>
              <li>Maintain the security and confidentiality of your login credentials.</li>
              <li>Accept responsibility for all activities that occur under your account.</li>
              <li>Notify us immediately of any unauthorised use of your account.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "#1a2035" }}>4. Acceptable Use</h2>
            <p>You agree to use the Platforms only for lawful purposes and in accordance with these Terms. You must not:</p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>Use a Platform in any way that violates any applicable local, national, or international law or regulation.</li>
              <li>Submit false, misleading, or fraudulent information, including in profiles, job listings, employment verifications, uploaded documents, connected data sources or contact submissions.</li>
              <li>Upload or input content that infringes the intellectual property, privacy, or other rights of any third party.</li>
              <li>Attempt to gain unauthorised access to any part of a Platform, other accounts, or any systems or networks connected to a Platform.</li>
              <li>Use automated tools, bots, scrapers, or scripts to access or interact with a Platform without our prior written consent.</li>
              <li>Reverse engineer, scrape, or attempt to extract the underlying models, prompts, or training data of our AI features.</li>
              <li>Interfere with or disrupt the integrity or performance of any Platform or its underlying infrastructure.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "#1a2035" }}>5. AI-Generated Outputs</h2>
            <p>
              The Platforms make extensive use of artificial intelligence — for example, candidate match scoring (AVANA Recruit), 30/60/90-day onboarding plans and sentiment indicators (AVANA Onboard), document summaries and conversational answers (AVANA Docs), and natural-language analytics over connected data sources (AVANA Insights). You acknowledge and agree that:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>AI-generated scores, plans, summaries, answers and analytics are produced algorithmically and are intended as guidance only.</li>
              <li>We do not guarantee the accuracy, completeness, currency or fitness for purpose of any AI-generated output.</li>
              <li>Hiring, onboarding, contractual, financial, operational and strategic decisions remain the sole responsibility of the User or their organisation, and must always involve appropriate human review.</li>
              <li>We are not liable for any decisions made or actions taken based solely on AI-generated outputs.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "#1a2035" }}>6. Platform-Specific Features</h2>
            <p>
              Some features are specific to a particular Platform and, where additional terms apply, those terms are presented in-product or referenced from the relevant feature:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li><strong>Employment Verification (AVANA Recruit):</strong> we facilitate verification requests between Candidates and the verifiers they nominate. We act solely as a facilitator and do not independently verify any employment claim. Candidates are responsible for ensuring they have appropriate consent before requesting a verification, and verifiers are responsible for the accuracy of their responses.</li>
              <li><strong>Document Pack and E-Signature (AVANA Onboard):</strong> we provide tooling for sending, collecting and storing onboarding documents. Customers remain responsible for the legal sufficiency of any document, contract, policy or e-signature workflow used through the Platform.</li>
              <li><strong>Document Upload and Q&amp;A (AVANA Docs):</strong> Customers are responsible for ensuring they have the right to upload, store, and analyse any documents uploaded to the Platform.</li>
              <li><strong>Third-Party Integrations (AVANA Insights and others):</strong> when you connect a third-party data source (e.g. a CRM, ERP, accounting system, spreadsheet or database), you authorise us to access, ingest and process the data exposed by that connection. Your use of the third-party service remains subject to that provider's own terms.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "#1a2035" }}>7. Data Protection and Privacy</h2>
            <p>
              We are committed to protecting your personal data in accordance with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018. Our collection and use of personal data is described in our <a href="/privacy-policy" style={{ color: "#4CAF50" }}>Privacy Policy</a>, which forms part of these Terms.
            </p>
            <p className="mt-3">
              Where AVANA processes personal data on behalf of a Customer (for example, candidate data inside AVANA Recruit, employee data inside AVANA Onboard, or business data ingested by AVANA Insights), we do so as a Data Processor on the Customer's instructions, subject to a Data Processing Agreement.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "#1a2035" }}>8. Intellectual Property</h2>
            <p>
              All content, features, and functionality of the Platforms — including text, graphics, logos, icons, software, AI models, prompts and the underlying algorithms — are the exclusive property of AVANA Services Limited or its licensors and are protected by copyright, trademark and other intellectual property laws.
            </p>
            <p className="mt-3">
              You retain ownership of the content and data you upload to or generate within the Platforms ("Customer Content"). You grant AVANA a worldwide, royalty-free licence to host, copy, display and process Customer Content solely to operate, secure and improve the Platforms and to provide the Services to you.
            </p>
            <p className="mt-3">
              You may not reproduce, distribute, modify, create derivative works of, publicly display, or otherwise use any content from the Platforms (other than your own Customer Content) without our prior written permission.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "#1a2035" }}>9. Fees and Payment</h2>
            <p>
              Certain Platforms or features may be subject to fees as outlined in the applicable order form, subscription agreement or in-product pricing. By subscribing to a paid plan, you agree to pay the applicable fees. All fees are stated in British Pounds Sterling (£) and are exclusive of VAT unless otherwise stated.
            </p>
            <p className="mt-3">
              We reserve the right to change our fees at any time. Any fee changes will be communicated to you in advance and will apply from the next billing cycle.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "#1a2035" }}>10. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, AVANA Services Limited shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or business opportunities, arising out of or in connection with your use of the Platforms.
            </p>
            <p className="mt-3">
              Our total liability to you for any claims arising from or related to these Terms or your use of the Platforms shall not exceed the total fees paid by you to us in the twelve (12) months preceding the claim. Nothing in these Terms limits or excludes liability that cannot be limited or excluded under applicable law (including liability for death or personal injury caused by negligence, or for fraud).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "#1a2035" }}>11. Termination</h2>
            <p>
              We may terminate or suspend your access to any Platform at any time, without prior notice or liability, for any reason, including if you breach these Terms. Upon termination, your right to use the affected Platform will immediately cease.
            </p>
            <p className="mt-3">
              You may terminate your account at any time by contacting us. Termination does not relieve you of any obligations incurred prior to termination.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "#1a2035" }}>12. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. We will notify Users of any material changes by posting the updated Terms with a revised "Last updated" date. Your continued use of any Platform after any changes constitutes acceptance of the updated Terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "#1a2035" }}>13. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of England and Wales. Any disputes arising from or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts of England and Wales.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "#1a2035" }}>14. Contact Us</h2>
            <p>If you have any questions about these Terms, please contact us at:</p>
            <div className="mt-3 p-4 rounded-lg" style={{ backgroundColor: "#f8f9fb", border: "1px solid #e5e7eb" }}>
              <p className="font-semibold" style={{ color: "#1a2035" }}>AVANA Services Limited</p>
              <p>Company Number: 15268633</p>
              <p>Registered Office: 85 Great Portland Street, London, W1W 7LT</p>
              <p className="mt-2">
                Email: <a href="mailto:enquiries@avanaservices.com" style={{ color: "#4CAF50" }}>enquiries@avanaservices.com</a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </LegalLayout>
  );
}
