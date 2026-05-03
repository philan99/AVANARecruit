import { useEffect } from "react";
import { InsightsLegalLayout } from "@/components/insights-legal-layout";

export default function PrivacyPolicy() {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <InsightsLegalLayout>
      <div className="max-w-3xl mx-auto px-6 lg:px-10 pt-16 pb-20">
        <h1 className="text-3xl lg:text-4xl font-bold mb-2" style={{ color: "#1a2035" }}>AVANA Insights — Privacy Policy</h1>
        <p className="text-sm mb-10" style={{ color: "#6b7280" }}>Last updated: April 2026</p>

        <div className="space-y-8 text-sm leading-relaxed" style={{ color: "#374151" }}>
          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "#1a2035" }}>1. About this Notice</h2>
            <p>
              This is a supplemental privacy notice for <strong>AVANA Insights</strong>, our AI-native data intelligence platform operated by AVANA Services Limited ("AVANA", "we", "us", "our"), a company registered in England and Wales (Company Number: 15268633).
            </p>
            <p className="mt-3">
              It describes how we collect, use and share data specifically through AVANA Insights, with a focus on the personal and business data ingested from the data sources you connect. It applies alongside the master AVANA Recruit Privacy Policy, which covers shared topics including legal basis for processing, data security, your rights under the UK GDPR, cookies, international data transfers, complaints to the ICO and our company contact details. Where this Insights notice addresses a topic specifically, it takes precedence; otherwise the master AVANA Services Privacy Policy applies unchanged.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "#1a2035" }}>2. Data We Collect Through AVANA Insights</h2>

            <h3 className="font-semibold mt-4 mb-2" style={{ color: "#1a2035" }}>2.1 Account and Workspace Data</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Account information:</strong> name, email address, organisation, role, authentication and access permissions of users invited to your AVANA Insights workspace.</li>
              <li><strong>Workspace configuration:</strong> the dashboards, saved questions, alerts and decision reports you create.</li>
            </ul>

            <h3 className="font-semibold mt-4 mb-2" style={{ color: "#1a2035" }}>2.2 Connected-Source Data</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Connection metadata:</strong> the type of source (e.g. HubSpot, Salesforce, Xero, Shopify, Google Sheets, PostgreSQL), the credentials or OAuth tokens authorising access (stored encrypted), the schemas exposed and the sync schedule.</li>
              <li><strong>Ingested records:</strong> the rows, files, fields and structured metadata ingested or referenced from each Connected Source — which may include personal data (such as names, emails, addresses, transactions) and business data (such as deals, invoices, orders, tickets, employees) that exists in your Connected Sources.</li>
              <li><strong>Lineage references:</strong> pointers and evidence snippets that allow Insights to be traced back to the underlying Customer Data they were derived from.</li>
            </ul>

            <h3 className="font-semibold mt-4 mb-2" style={{ color: "#1a2035" }}>2.3 Query and Output Data</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Questions and prompts:</strong> the natural-language questions, prompts and follow-ups you submit.</li>
              <li><strong>AI-generated outputs:</strong> the Insights, summaries, charts, dashboards and Decision Reports produced in response.</li>
              <li><strong>Usage and technical data:</strong> as described in the master AVANA Services Privacy Policy (e.g. browser, OS, IP address, session data and essential cookies).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "#1a2035" }}>3. How We Use This Data</h2>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li><strong>Operating the Service:</strong> to ingest and index Customer Data from your Connected Sources, answer your questions, build dashboards and generate Decision Reports.</li>
              <li><strong>Lineage and trust:</strong> to surface evidence and source references alongside each Insight so you can validate it.</li>
              <li><strong>Workspace administration:</strong> to provision users, manage permissions and operate audit logs within your workspace.</li>
              <li><strong>Support and reliability:</strong> to investigate errors, ensure reliability and respond to support requests.</li>
              <li><strong>Security and abuse prevention:</strong> to detect and prevent unauthorised access, abuse and security incidents.</li>
              <li><strong>Legal compliance:</strong> to comply with applicable laws and respond to lawful requests.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "#1a2035" }}>4. Roles and Responsibilities</h2>
            <p>
              For account and workspace administration data we collect directly to operate AVANA Insights (for example, user accounts and access logs), AVANA acts as a <strong>Data Controller</strong>.
            </p>
            <p className="mt-3">
              For Customer Data ingested from your Connected Sources, AVANA acts as a <strong>Data Processor</strong> on your organisation's instructions; your organisation acts as the Data Controller. This is governed by a Data Processing Agreement. Where Customer Data includes personal data of your customers, employees or other data subjects, your organisation is responsible for the lawful basis for sharing that data with AVANA, providing required notices to data subjects, and responding to data-subject rights requests in respect of that data.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "#1a2035" }}>5. No Training on Customer Data</h2>
            <p>
              AVANA does <strong>not</strong> use Customer Data to train generalised public AI models. Customer Data is used solely to operate AVANA Insights for the customer that owns it. Aggregate, fully de-identified usage statistics (for example, query latency or error rates) may be used to improve platform reliability and performance, but never the content of your Customer Data, queries or Insights.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "#1a2035" }}>6. Sharing</h2>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li><strong>Inside your workspace:</strong> Insights, dashboards and Decision Reports are visible to the users your organisation has authorised to access the relevant workspace, source or report.</li>
              <li><strong>Connected Sources:</strong> AVANA Insights only reads from the Connected Sources you authorise. We do not write back to those sources unless you explicitly enable a feature that does so.</li>
              <li><strong>Service providers:</strong> we share data with trusted third-party service providers (e.g. cloud hosting, AI infrastructure, email delivery via Resend, database providers) who help us operate AVANA Insights, subject to appropriate data-processing agreements.</li>
              <li><strong>Legal requirements:</strong> we may disclose data if required by law, regulation or legal process, or where necessary to protect our rights or the safety of others.</li>
            </ul>
            <p className="mt-3">
              We do not sell Customer Data and we do not share Customer Data for advertising purposes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "#1a2035" }}>7. AI Outputs and Automated Decision-Making</h2>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>Insights are produced algorithmically from the Customer Data available at the time of the query.</li>
              <li>No solely automated decisions with legal or similarly significant effects are made about data subjects through AVANA Insights. Insights are guidance to assist humans (analysts, managers, executives) in their decisions.</li>
              <li>Final business, operational, financial and strategic decisions are always made by humans.</li>
              <li>Where an Insight materially affects an individual, that individual has the right to request human review and to understand the logic involved at a high level.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "#1a2035" }}>8. Retention</h2>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li><strong>Connected-Source data:</strong> retained while the connection is active. After you disconnect a source or delete a workspace, ingested data is deleted or anonymised within a commercially reasonable period, subject to backup, audit-log and legal-retention obligations.</li>
              <li><strong>Queries and AI-generated outputs:</strong> retained while the workspace is active so you can revisit prior questions, dashboards and Decision Reports. Individual items can be deleted by an authorised user at any time.</li>
              <li><strong>Account data:</strong> retained while the account is active. Following account closure, residual data is retained for up to 12 months for legitimate-interest, legal-compliance and dispute-resolution purposes.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "#1a2035" }}>9. Other Privacy Topics (Defer to Master)</h2>
            <p>
              For information about our legal basis for processing under the UK GDPR, data security, your rights (access, rectification, erasure, restriction, portability, objection, withdrawal of consent), cookies, international data transfers, our use of service providers, and how to lodge a complaint with the Information Commissioner's Office, please see the master AVANA Recruit Privacy Policy. It applies to AVANA Insights and forms part of this notice.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "#1a2035" }}>10. Contact Us</h2>
            <p>If you have any questions about this notice, or wish to exercise your data protection rights, please contact us at:</p>
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
    </InsightsLegalLayout>
  );
}
