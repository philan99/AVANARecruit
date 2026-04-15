import logoUrl from "@assets/AVANA_Recruit_1776280304155.png";
import { Link } from "wouter";
import { useEffect } from "react";

export default function PrivacyPolicy() {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#ffffff" }}>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b" style={{ backgroundColor: "rgba(26, 32, 53, 0.97)", borderColor: "rgba(255,255,255,0.08)", backdropFilter: "blur(12px)" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-[72px] flex items-center justify-between">
          <Link href="/" className="cursor-pointer">
            <img src={logoUrl} alt="AVANA Recruit" className="h-7" />
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 lg:px-10 pt-[120px] pb-20">
        <h1 className="text-3xl lg:text-4xl font-bold mb-2" style={{ color: "#1a2035" }}>Privacy Policy</h1>
        <p className="text-sm mb-10" style={{ color: "#6b7280" }}>Last updated: April 2026</p>

        <div className="space-y-8 text-sm leading-relaxed" style={{ color: "#374151" }}>
          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "#1a2035" }}>1. Introduction</h2>
            <p>
              AVANA Services Limited ("we", "us", "our"), a company registered in England and Wales (Company Number: 15268633), is committed to protecting and respecting your privacy.
            </p>
            <p className="mt-3">
              This Privacy Policy explains how we collect, use, store, and share your personal data when you use the AVANA Recruit platform ("Platform"), and your rights in relation to that data. This policy applies to all Users of the Platform, including Candidates, Companies, and visitors.
            </p>
            <p className="mt-3">
              We act as the Data Controller for the personal data processed through the Platform, in accordance with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "#1a2035" }}>2. Information We Collect</h2>
            <p>We may collect and process the following categories of personal data:</p>
            <h3 className="font-semibold mt-4 mb-2" style={{ color: "#1a2035" }}>2.1 Information You Provide</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Account Information:</strong> Name, email address, and role selection (Candidate or Company).</li>
              <li><strong>Candidate Profile Data:</strong> Current job title, skills, experience, education history, salary expectations, location preferences, availability, work authorisation status, LinkedIn and social media URLs, and any other information you choose to include in your profile.</li>
              <li><strong>Company Profile Data:</strong> Company name, industry, size, location, website, description, and contact details.</li>
              <li><strong>Job Listing Data:</strong> Job titles, descriptions, requirements, salary ranges, and workplace preferences.</li>
              <li><strong>Verification Data:</strong> Names and email addresses of individuals you request to verify your employment history, and the responses provided by those individuals.</li>
              <li><strong>Contact Form Data:</strong> Name, email address, and message content submitted through our Contact Us form.</li>
            </ul>
            <h3 className="font-semibold mt-4 mb-2" style={{ color: "#1a2035" }}>2.2 Information Collected Automatically</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Usage Data:</strong> Information about how you interact with the Platform, including pages visited, features used, and actions taken.</li>
              <li><strong>Technical Data:</strong> Browser type, operating system, IP address, and device information.</li>
              <li><strong>Cookies:</strong> We may use essential cookies to maintain session state and Platform functionality.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "#1a2035" }}>3. How We Use Your Information</h2>
            <p>We process your personal data for the following purposes:</p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li><strong>Providing Our Services:</strong> To operate the Platform, create and manage your account, and deliver our AI-powered job matching services.</li>
              <li><strong>Matching:</strong> To use our artificial intelligence algorithms to match Candidates with suitable job opportunities based on skills, experience, education, and location preferences.</li>
              <li><strong>Verification:</strong> To facilitate employment verification requests between Candidates and their nominated verifiers.</li>
              <li><strong>Communication:</strong> To send transactional emails related to your use of the Platform, respond to contact form enquiries, and send verification request emails.</li>
              <li><strong>Platform Improvement:</strong> To analyse usage patterns and improve the Platform's features, functionality, and user experience.</li>
              <li><strong>Legal Compliance:</strong> To comply with applicable laws, regulations, and legal processes.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "#1a2035" }}>4. Legal Basis for Processing</h2>
            <p>We process your personal data on the following legal bases under the UK GDPR:</p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li><strong>Contract Performance (Article 6(1)(b)):</strong> Processing necessary to provide our Services to you, including account management, job matching, and verification facilitation.</li>
              <li><strong>Legitimate Interests (Article 6(1)(f)):</strong> Processing necessary for our legitimate interests, including improving our Platform, ensuring security, and analysing usage patterns, where these interests are not overridden by your rights.</li>
              <li><strong>Consent (Article 6(1)(a)):</strong> Where you have given specific consent to the processing of your personal data, such as when submitting a contact form enquiry.</li>
              <li><strong>Legal Obligation (Article 6(1)(c)):</strong> Processing necessary to comply with a legal obligation to which we are subject.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "#1a2035" }}>5. How We Share Your Information</h2>
            <p>We may share your personal data in the following circumstances:</p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li><strong>Recruitment Matching:</strong> Candidate profile information (including name, skills, experience, and qualifications) may be shared with Companies that have active job listings on the Platform, for the purpose of recruitment matching.</li>
              <li><strong>Company Visibility:</strong> Company profile information may be visible to Candidates browsing the Platform.</li>
              <li><strong>Employment Verification:</strong> When a Candidate initiates a verification request, the verifier's name and email will be used solely to send the verification request. Verification responses will be associated with the Candidate's profile.</li>
              <li><strong>Service Providers:</strong> We may share data with trusted third-party service providers who assist us in operating the Platform, such as email delivery services (e.g., Resend) and hosting providers, subject to appropriate data processing agreements.</li>
              <li><strong>Legal Requirements:</strong> We may disclose your data if required by law, regulation, or legal process, or if we believe disclosure is necessary to protect our rights, your safety, or the safety of others.</li>
            </ul>
            <p className="mt-3">
              We do not sell your personal data to third parties. We do not share your data for marketing purposes without your explicit consent.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "#1a2035" }}>6. AI-Powered Matching and Automated Decision-Making</h2>
            <p>
              Our Platform uses artificial intelligence to generate match scores between Candidates and job opportunities. You should be aware that:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>Match scores are generated algorithmically based on the data you provide in your profile and job listings.</li>
              <li>No solely automated decisions with legal or similarly significant effects are made about you. Match scores are provided as guidance to assist Companies and Candidates in their recruitment decisions.</li>
              <li>Hiring decisions are always made by humans (Companies), not by our AI algorithms.</li>
              <li>You have the right to request human review of any automated assessment and to understand the logic involved in the matching process.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "#1a2035" }}>7. Data Retention</h2>
            <p>We retain your personal data for as long as necessary to fulfil the purposes for which it was collected, including:</p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li><strong>Active Accounts:</strong> Your data is retained for as long as your account remains active on the Platform.</li>
              <li><strong>Closed Accounts:</strong> Following account termination, we may retain certain data for up to 12 months to comply with legal obligations, resolve disputes, and enforce our agreements.</li>
              <li><strong>Verification Records:</strong> Verification request and response data is retained for as long as the associated Candidate account is active.</li>
              <li><strong>Contact Enquiries:</strong> Contact form submissions are retained for up to 24 months.</li>
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
              <li>Secure database storage with access controls.</li>
              <li>Use of unique, time-limited tokens for verification requests rather than exposing personal data.</li>
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
              <li><strong>Right of Access:</strong> You have the right to request a copy of the personal data we hold about you.</li>
              <li><strong>Right to Rectification:</strong> You have the right to request that we correct any inaccurate or incomplete personal data.</li>
              <li><strong>Right to Erasure:</strong> You have the right to request the deletion of your personal data, subject to certain legal exceptions.</li>
              <li><strong>Right to Restriction of Processing:</strong> You have the right to request that we restrict the processing of your personal data in certain circumstances.</li>
              <li><strong>Right to Data Portability:</strong> You have the right to receive your personal data in a structured, commonly used, and machine-readable format.</li>
              <li><strong>Right to Object:</strong> You have the right to object to the processing of your personal data where we are relying on legitimate interests.</li>
              <li><strong>Right to Withdraw Consent:</strong> Where processing is based on consent, you have the right to withdraw that consent at any time.</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, please contact us using the details provided in Section 13 below. We will respond to your request within one month, as required by law.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "#1a2035" }}>10. Cookies</h2>
            <p>
              Our Platform uses essential cookies that are strictly necessary for the operation of the Platform. These cookies enable core functionality such as maintaining your session and remembering your role selection.
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
              We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the updated policy on the Platform with a revised "Last updated" date. We encourage you to review this policy periodically.
            </p>
            <p className="mt-3">
              Your continued use of the Platform after any changes to this Privacy Policy constitutes your acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "#1a2035" }}>13. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, or wish to exercise your data protection rights, please contact us at:</p>
            <div className="mt-3 p-4 rounded-lg" style={{ backgroundColor: "#f8f9fb", border: "1px solid #e5e7eb" }}>
              <p className="font-semibold" style={{ color: "#1a2035" }}>AVANA Services Limited</p>
              <p>Company Number: 15268633</p>
              <p className="mt-2">
                Email: <a href="mailto:enquiries@avanaservices.com" style={{ color: "#4CAF50" }}>enquiries@avanaservices.com</a>
              </p>
              <p className="mt-1">
                Or use our <Link href="/contact-us" style={{ color: "#4CAF50" }}>Contact Us</Link> form.
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

      <footer style={{ backgroundColor: "#1a2035", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <img src={logoUrl} alt="AVANA Recruit" className="h-6" />
            <div className="flex items-center gap-4">
              <Link href="/terms" className="text-xs hover:text-white/60 transition-colors" style={{ color: "rgba(255,255,255,0.3)" }}>
                Terms & Conditions
              </Link>
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.15)" }}>|</span>
              <Link href="/privacy-policy" className="text-xs hover:text-white/60 transition-colors" style={{ color: "rgba(255,255,255,0.3)" }}>
                Privacy Policy
              </Link>
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.15)" }}>|</span>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
                © 2026 AVANA Services Limited. Company Number: 15268633
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
