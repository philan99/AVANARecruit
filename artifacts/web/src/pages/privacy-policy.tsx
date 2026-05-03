import { useEffect } from "react";
import { RecruitLegalLayout } from "@/components/recruit-legal-layout";

export default function PrivacyPolicy() {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <RecruitLegalLayout>
      <div className="max-w-3xl mx-auto px-6 lg:px-10 pt-16 pb-20">
        <h1 className="text-3xl lg:text-4xl font-bold mb-2" style={{ color: "#1a2035" }}>AVANA Recruit — Privacy Policy</h1>
        <p className="text-sm mb-10" style={{ color: "#6b7280" }}>Last updated: April 2026</p>

        <div className="space-y-8 text-sm leading-relaxed" style={{ color: "#374151" }}>
          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "#1a2035" }}>1. About this Notice</h2>
            <p>
              This is a supplemental privacy notice for <strong>AVANA Recruit</strong>, our AI-powered talent matching platform operated by AVANA Services Limited ("AVANA", "we", "us", "our"), a company registered in England and Wales (Company Number: 15268633).
            </p>
            <p className="mt-3">
              It describes how we collect, use and share personal data specifically through AVANA Recruit. It applies alongside the master AVANA Privacy Policy, which covers shared topics including legal basis for processing, data security, your rights under the UK GDPR, cookies, international data transfers, complaints to the ICO and our company contact details. Where this Recruit notice addresses a topic specifically, it takes precedence; otherwise the master AVANA Services Privacy Policy applies unchanged.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "#1a2035" }}>2. Data We Collect Through AVANA Recruit</h2>

            <h3 className="font-semibold mt-4 mb-2" style={{ color: "#1a2035" }}>2.1 If you are a Candidate</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Profile data:</strong> name, contact details, current and past job titles, skills, experience, education, certifications, salary expectations, location preferences, availability, work authorisation, and links you choose to add (e.g. portfolio, LinkedIn).</li>
              <li><strong>CV and uploaded documents:</strong> the content of any CV or supporting document you upload, and any AI-generated rewrite or summary of that content.</li>
              <li><strong>Activity data:</strong> the Job Listings and Companies you view, save, apply to or shortlist; alerts you set; and your match history.</li>
              <li><strong>Verification data:</strong> the Verifiers you nominate, the requests you send and the responses received.</li>
            </ul>

            <h3 className="font-semibold mt-4 mb-2" style={{ color: "#1a2035" }}>2.2 If you are a Company user</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Company profile data:</strong> company name, sector, size, location, branding and contact details.</li>
              <li><strong>Job Listings:</strong> the role descriptions, requirements, salary bands and other details you publish.</li>
              <li><strong>Pipeline data:</strong> notes, statuses, ratings, alerts and team activity associated with Candidates you are evaluating.</li>
              <li><strong>Team and seat data:</strong> names, emails and roles of users you invite into your workspace.</li>
            </ul>

            <h3 className="font-semibold mt-4 mb-2" style={{ color: "#1a2035" }}>2.3 If you are a Verifier</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Identification data:</strong> the name and email address provided by the Candidate who nominated you, used solely to deliver the verification request.</li>
              <li><strong>Verification responses:</strong> the answers you submit confirming or correcting employment details.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "#1a2035" }}>3. How We Use This Data</h2>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li><strong>Match generation:</strong> to score Matches between Candidates and Job Listings across role-relevant dimensions.</li>
              <li><strong>Surfacing opportunities:</strong> to show Candidates relevant Job Listings and to show Companies relevant Candidates for their open roles.</li>
              <li><strong>Verification facilitation:</strong> to deliver verification requests to Verifiers and surface their responses to the requesting Candidate.</li>
              <li><strong>Workspace operation:</strong> to operate Company pipelines, alerts, team-member access and notes.</li>
              <li><strong>Communications:</strong> to send transactional emails (account, alerts, verifications) related to your use of AVANA Recruit.</li>
              <li><strong>Platform improvement:</strong> to analyse aggregated usage patterns. We do not use Candidate or Company Customer Content to train generalised public AI models.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "#1a2035" }}>4. Sharing Within the Platform</h2>
            <p>By design, some data is shared between participants on AVANA Recruit:</p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li><strong>Candidate → Company:</strong> Companies with active Job Listings can be matched with relevant Candidate profiles. Companies see profile information necessary to evaluate fit (e.g. experience, skills, location, availability). Direct contact details are surfaced only when the Candidate has consented to be contacted for a specific Job Listing or has otherwise enabled outreach.</li>
              <li><strong>Company → Candidate:</strong> Candidates can browse and view the company profile and Job Listings published by Companies on the platform.</li>
              <li><strong>Verifier flow:</strong> when a Candidate nominates a Verifier, the Verifier's name and email are used by AVANA solely to send the verification request; the response is associated with the Candidate's profile.</li>
            </ul>
            <p className="mt-3">
              We do not sell personal data and we do not share Candidate or Company data for advertising purposes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "#1a2035" }}>5. Roles and Responsibilities</h2>
            <p>
              AVANA acts as a <strong>Data Controller</strong> for the personal data we collect directly to operate AVANA Recruit (for example, account, contact and platform usage data). AVANA acts as a <strong>Data Processor</strong> for personal data we process on behalf of a Company (for example, Candidates added to a Company's pipeline, internal notes and ratings, verification responses surfaced to a specific Company), in each case subject to a Data Processing Agreement.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "#1a2035" }}>6. AI Scoring and Automated Decision-Making</h2>
            <p>
              AVANA Recruit uses AI to generate match scores. You should be aware that:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>Match scores are produced algorithmically from data Candidates and Companies provide.</li>
              <li>No solely automated decisions with legal or similarly significant effects are made about Candidates. AI outputs are guidance to assist Companies in their hiring process.</li>
              <li>Final hiring, interview, rejection and offer decisions are always made by humans.</li>
              <li>Candidates have the right to request human review of any automated assessment that materially affects them and to understand the logic involved at a high level.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "#1a2035" }}>7. Retention</h2>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li><strong>Active Candidate accounts:</strong> profile and CV data are retained while your account is active and until you delete it.</li>
              <li><strong>Closed Candidate accounts:</strong> following deletion, residual data is retained for up to 12 months for legitimate-interest, legal-compliance and dispute-resolution purposes.</li>
              <li><strong>Verification records:</strong> retained for as long as the associated Candidate account is active.</li>
              <li><strong>Company workspace data:</strong> Job Listings, pipeline notes and team-member records are retained for the duration of the Company's subscription, plus any retention period required by law.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "#1a2035" }}>8. Other Privacy Topics (Defer to Master)</h2>
            <p>
              For information about our legal basis for processing under the UK GDPR, data security, your rights (access, rectification, erasure, restriction, portability, objection, withdrawal of consent), cookies, international data transfers, our use of service providers, and how to lodge a complaint with the Information Commissioner's Office, please see the master AVANA Privacy Policy. It applies to AVANA Recruit and forms part of this notice.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "#1a2035" }}>9. Contact Us</h2>
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
    </RecruitLegalLayout>
  );
}
