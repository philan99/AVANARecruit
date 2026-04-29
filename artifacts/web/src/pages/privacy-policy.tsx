import { useEffect } from "react";
import { LegalLayout } from "@/components/legal-layout";

export default function PrivacyPolicy() {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <LegalLayout>
      <div className="max-w-3xl mx-auto px-6 lg:px-10 pt-16 pb-20">
        <h1 className="text-3xl lg:text-4xl font-bold mb-2" style={{ color: "#1a2035" }}>Privacy Policy</h1>
        <p className="text-sm mb-10" style={{ color: "#6b7280" }}>Last updated: April 2026</p>

        <div className="space-y-8 text-sm leading-relaxed" style={{ color: "#374151" }}>
          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "#1a2035" }}>1. Introduction</h2>
            <p>
              AVANA Services Limited ("AVANA", "we", "us", "our"), a company registered in England and Wales (Company Number: 15268633), is committed to protecting and respecting your privacy.
            </p>
            <p className="mt-3">
              This Privacy Policy explains how we collect, use, store, and share your personal data when you use any platform in the AVANA Suite — currently AVANA Recruit, AVANA Onboard, AVANA Docs and AVANA Insights, together with the parent AVANA Services site (each a "Platform" and together the "Platforms") — and your rights in relation to that data. It applies to all Users, including individual end users, customer organisations, and visitors.
            </p>
            <p className="mt-3">
              We act as the Data Controller for personal data we collect directly through the Platforms (for example, account, contact and usage data), and as a Data Processor for personal data processed on behalf of a customer organisation (for example, candidate data inside AVANA Recruit, employee data inside AVANA Onboard or business data ingested by AVANA Insights), in each case in accordance with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "#1a2035" }}>2. Information We Collect</h2>
            <p>The categories of personal data we may collect and process depend on which Platform(s) you use.</p>

            <h3 className="font-semibold mt-4 mb-2" style={{ color: "#1a2035" }}>2.1 Information Common to All Platforms</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Account Information:</strong> name, email address, organisation, role, and authentication data.</li>
              <li><strong>Contact Form Data:</strong> name, email address, company, the Platform of interest, and message content submitted through any "Contact Us" or "Partner With Us" form.</li>
              <li><strong>Communications:</strong> records of correspondence between you and AVANA (e.g. support emails).</li>
            </ul>

            <h3 className="font-semibold mt-4 mb-2" style={{ color: "#1a2035" }}>2.2 Platform-Specific Information</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>AVANA Recruit:</strong> candidate profile data (job title, skills, experience, education, salary expectations, location preferences, availability, work authorisation, profile and social URLs); company profile and job listing data; verification requests and responses.</li>
              <li><strong>AVANA Onboard:</strong> new-hire profile data, onboarding plan progress, document pack contents, e-signature events, and check-in / sentiment responses.</li>
              <li><strong>AVANA Docs:</strong> documents and files you upload, the questions you ask of those documents, and the AI-generated answers and annotations.</li>
              <li><strong>AVANA Insights:</strong> the metadata, schemas and records ingested from data sources you connect (e.g. HubSpot, Salesforce, Xero, Shopify, Sheets, PostgreSQL), and the questions you ask of that data.</li>
            </ul>

            <h3 className="font-semibold mt-4 mb-2" style={{ color: "#1a2035" }}>2.3 Information Collected Automatically</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Usage Data:</strong> information about how you interact with a Platform, including pages visited, features used, and actions taken.</li>
              <li><strong>Technical Data:</strong> browser type, operating system, IP address, and device information.</li>
              <li><strong>Cookies:</strong> we use essential cookies to maintain session state and core Platform functionality.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "#1a2035" }}>3. How We Use Your Information</h2>
            <p>We process your personal data for the following purposes:</p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li><strong>Providing the Services:</strong> to operate the Platforms, create and manage your account, and deliver the AI-powered features specific to each Platform (matching, onboarding, document Q&amp;A, analytics, etc.).</li>
              <li><strong>Facilitating Specific Features:</strong> to facilitate employment verification requests (AVANA Recruit), onboarding document and check-in workflows (AVANA Onboard), document analysis (AVANA Docs) and natural-language data querying (AVANA Insights).</li>
              <li><strong>Communication:</strong> to send transactional emails related to your use of the Platforms, respond to contact form enquiries, and send verification or notification emails.</li>
              <li><strong>Platform Improvement:</strong> to analyse aggregated usage patterns and improve the Platforms' features, performance and user experience. We do not use your Customer Content to train generalised public AI models.</li>
              <li><strong>Security and Fraud Prevention:</strong> to detect, investigate and prevent unauthorised access, abuse and security incidents.</li>
              <li><strong>Legal Compliance:</strong> to comply with applicable laws, regulations and legal processes.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "#1a2035" }}>4. Legal Basis for Processing</h2>
            <p>We process your personal data on the following legal bases under the UK GDPR:</p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li><strong>Contract Performance (Article 6(1)(b)):</strong> processing necessary to provide the Services to you, including account management and the Platform-specific features you use.</li>
              <li><strong>Legitimate Interests (Article 6(1)(f)):</strong> processing necessary for our legitimate interests, including improving and securing the Platforms and analysing usage patterns, where these interests are not overridden by your rights.</li>
              <li><strong>Consent (Article 6(1)(a)):</strong> where you have given specific consent, such as when submitting a contact form enquiry or opting in to a non-essential communication.</li>
              <li><strong>Legal Obligation (Article 6(1)(c)):</strong> processing necessary to comply with a legal obligation to which we are subject.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "#1a2035" }}>5. How We Share Your Information</h2>
            <p>We may share your personal data in the following circumstances:</p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li><strong>Within the Platform You Use:</strong> some Platforms are designed to share information between participants — for example, AVANA Recruit shares candidate profile information with companies that have active job listings, and AVANA Onboard shares new-hire information with the employing organisation. We share this information only as required to deliver the feature you are using.</li>
              <li><strong>Employment Verification (AVANA Recruit):</strong> when a candidate initiates a verification request, the verifier's name and email are used solely to send the verification request. Verification responses are associated with the candidate's profile.</li>
              <li><strong>Connected Data Sources (AVANA Insights and others):</strong> where you connect a third-party data source, we access only the data exposed by your authorised connection. We do not push your AVANA data back into those third-party services unless you explicitly enable it.</li>
              <li><strong>Service Providers:</strong> we may share data with trusted third-party service providers who help us operate the Platforms — e.g. cloud hosting, email delivery (Resend), database providers and AI infrastructure — subject to appropriate data processing agreements.</li>
              <li><strong>Legal Requirements:</strong> we may disclose your data if required by law, regulation or legal process, or if we believe disclosure is necessary to protect our rights, your safety or the safety of others.</li>
            </ul>
            <p className="mt-3">
              We do not sell your personal data to third parties. We do not share your data for marketing purposes without your explicit consent.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "#1a2035" }}>6. AI Features and Automated Decision-Making</h2>
            <p>
              Several of our Platforms use artificial intelligence to generate scores, plans, summaries, answers or analytics — for example, candidate match scores (AVANA Recruit), 30/60/90-day onboarding plans and sentiment indicators (AVANA Onboard), document summaries and conversational answers (AVANA Docs) and natural-language analytics (AVANA Insights). You should be aware that:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>AI-generated outputs are produced algorithmically based on the data you and your organisation provide.</li>
              <li>No solely automated decisions with legal or similarly significant effects are made about you. AI outputs are provided as guidance to assist humans (Customers, hiring managers, analysts, etc.) in their decisions.</li>
              <li>Final hiring, onboarding, contractual and operational decisions are always made by humans, not by our AI features.</li>
              <li>You have the right to request human review of any automated assessment that materially affects you, and to understand the logic involved at a high level.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "#1a2035" }}>7. Data Retention</h2>
            <p>We retain your personal data for as long as necessary to fulfil the purposes for which it was collected, including:</p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li><strong>Active Accounts:</strong> your data is retained for as long as your account remains active on a Platform.</li>
              <li><strong>Closed Accounts:</strong> following account termination, we may retain certain data for up to 12 months to comply with legal obligations, resolve disputes and enforce our agreements.</li>
              <li><strong>Verification Records:</strong> verification request and response data is retained for as long as the associated candidate account is active.</li>
              <li><strong>Onboarding and Document Records:</strong> documents and onboarding records are retained for the duration of the customer's subscription, plus any retention period required by law.</li>
              <li><strong>Connected-Source Data:</strong> data ingested from connected sources is retained while the connection remains active and for a short period thereafter to allow safe disconnection.</li>
              <li><strong>Contact Enquiries:</strong> contact form submissions are retained for up to 24 months.</li>
            </ul>
            <p className="mt-3">
              After the applicable retention period, your personal data will be securely deleted or anonymised.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "#1a2035" }}>8. Data Security</h2>
            <p>
              We implement appropriate technical and organisational measures to protect your personal data against unauthorised access, alteration, disclosure, or destruction. These measures include:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>Encryption of data in transit using TLS/SSL.</li>
              <li>Per-tenant data isolation and access controls.</li>
              <li>Use of unique, time-limited tokens for sensitive flows (e.g. verification, password reset).</li>
              <li>Regular review and updating of security practices.</li>
            </ul>
            <p className="mt-3">
              While we take all reasonable precautions, no method of transmission over the internet or electronic storage is 100% secure. We cannot guarantee the absolute security of your data.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "#1a2035" }}>9. Your Rights</h2>
            <p>Under the UK GDPR, you have the following rights in relation to your personal data:</p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li><strong>Right of Access:</strong> to request a copy of the personal data we hold about you.</li>
              <li><strong>Right to Rectification:</strong> to request that we correct any inaccurate or incomplete personal data.</li>
              <li><strong>Right to Erasure:</strong> to request the deletion of your personal data, subject to certain legal exceptions.</li>
              <li><strong>Right to Restriction of Processing:</strong> to request that we restrict the processing of your personal data in certain circumstances.</li>
              <li><strong>Right to Data Portability:</strong> to receive your personal data in a structured, commonly used and machine-readable format.</li>
              <li><strong>Right to Object:</strong> to object to processing where we are relying on legitimate interests.</li>
              <li><strong>Right to Withdraw Consent:</strong> where processing is based on consent, to withdraw that consent at any time.</li>
            </ul>
            <p className="mt-3">
              Where AVANA acts as a Data Processor on behalf of a customer organisation, requests to exercise these rights should be made to that organisation, which acts as the Data Controller. To exercise any of these rights with AVANA directly, please contact us using the details in Section 13 below. We will respond to your request within one month, as required by law.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "#1a2035" }}>10. Cookies</h2>
            <p>
              The Platforms use essential cookies that are strictly necessary for their operation. These cookies enable core functionality such as maintaining your session and remembering your role or workspace selection.
            </p>
            <p className="mt-3">
              We do not use advertising or tracking cookies. We do not use third-party analytics cookies without your consent.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "#1a2035" }}>11. International Data Transfers</h2>
            <p>
              Your personal data may be processed and stored on servers located outside the United Kingdom. Where we transfer personal data outside the UK, we ensure that appropriate safeguards are in place, including:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>Transfers to countries with an adequacy decision from the UK Government.</li>
              <li>Use of Standard Contractual Clauses approved by the Information Commissioner's Office (ICO).</li>
              <li>Other appropriate safeguards as required by the UK GDPR.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "#1a2035" }}>12. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the updated policy with a revised "Last updated" date. We encourage you to review this policy periodically.
            </p>
            <p className="mt-3">
              Your continued use of any Platform after any changes to this Privacy Policy constitutes your acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "#1a2035" }}>13. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, or wish to exercise your data protection rights, please contact us at:</p>
            <div className="mt-3 p-4 rounded-lg" style={{ backgroundColor: "#f8f9fb", border: "1px solid #e5e7eb" }}>
              <p className="font-semibold" style={{ color: "#1a2035" }}>AVANA Services Limited</p>
              <p>Company Number: 15268633</p>
              <p>Registered Office: 85 Great Portland Street, London, W1W 7LT</p>
              <p className="mt-2">
                Email: <a href="mailto:enquiries@avanaservices.com" style={{ color: "#4CAF50" }}>enquiries@avanaservices.com</a>
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "#1a2035" }}>14. Complaints</h2>
            <p>
              If you are unhappy with how we have handled your personal data, you have the right to lodge a complaint with the Information Commissioner's Office (ICO):
            </p>
            <div className="mt-3 p-4 rounded-lg" style={{ backgroundColor: "#f8f9fb", border: "1px solid #e5e7eb" }}>
              <p className="font-semibold" style={{ color: "#1a2035" }}>Information Commissioner's Office</p>
              <p className="mt-2">
                Website: <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" style={{ color: "#4CAF50" }}>ico.org.uk</a>
              </p>
              <p className="mt-1">Telephone: 0303 123 1113</p>
            </div>
          </section>
        </div>
      </div>
    </LegalLayout>
  );
}
