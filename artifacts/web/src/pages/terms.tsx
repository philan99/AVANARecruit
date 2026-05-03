import { useEffect } from "react";
import { RecruitLegalLayout } from "@/components/recruit-legal-layout";

export default function Terms() {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <RecruitLegalLayout>
      <div className="max-w-3xl mx-auto px-6 lg:px-10 pt-16 pb-20">
        <h1 className="text-3xl lg:text-4xl font-bold mb-2" style={{ color: "#1a2035" }}>AVANA Recruit — Terms and Conditions</h1>
        <p className="text-sm mb-10" style={{ color: "#6b7280" }}>Last updated: April 2026</p>

        <div className="space-y-8 text-sm leading-relaxed" style={{ color: "#374151" }}>
          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "#1a2035" }}>1. About these Terms</h2>
            <p>
              These supplemental Terms and Conditions ("Recruit Terms") govern your use of <strong>AVANA Recruit</strong> — our AI-powered talent matching platform — operated by AVANA Services Limited, a company registered in England and Wales (Company Number: 15268633) ("AVANA", "we", "us", "our").
            </p>
            <p className="mt-3">
              The Recruit Terms apply alongside the master AVANA Terms and Conditions, which cover account registration, acceptable use, intellectual property, fees, limitation of liability, termination, governing law, and other shared provisions. Where the Recruit Terms address a topic specifically, they take precedence; otherwise the master AVANA Services Terms apply unchanged.
            </p>
            <p className="mt-3">
              By using AVANA Recruit, you confirm that you have read and accept both these Recruit Terms and the master AVANA Services Terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "#1a2035" }}>2. Recruit-Specific Definitions</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>"Candidate"</strong> means an individual using AVANA Recruit to manage their professional profile, browse opportunities, request verifications and be considered for roles.</li>
              <li><strong>"Company"</strong> means an organisation using AVANA Recruit to publish job listings, review candidates, manage pipelines and conduct outreach.</li>
              <li><strong>"Job Listing"</strong> means an opportunity published by a Company through AVANA Recruit.</li>
              <li><strong>"Match"</strong> means an algorithmically scored pairing between a Candidate and a Job Listing.</li>
              <li><strong>"Verification"</strong> means an employment-history confirmation requested by a Candidate from a nominated Verifier.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "#1a2035" }}>3. Candidate Use</h2>
            <p>If you use AVANA Recruit as a Candidate, you agree that:</p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>You will provide accurate information in your profile, including job title, skills, experience, education, salary expectations, location preferences, availability and work authorisation.</li>
              <li>You have the right to share any CV, certificate, portfolio link or other content you upload.</li>
              <li>You authorise AVANA to use your profile data to generate match scores and to surface your profile to Companies whose Job Listings you are a relevant fit for, until you withdraw consent or delete your account.</li>
              <li>You are solely responsible for evaluating any opportunity, Company or offer presented to you through the platform.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "#1a2035" }}>4. Company Use</h2>
            <p>If you use AVANA Recruit as a Company (or as a hiring user inside a Company), you agree that:</p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>Job Listings, company profile information and outreach messages must be accurate, lawful and free of discriminatory criteria.</li>
              <li>You will use Candidate information solely for the purpose of evaluating candidates for current or genuinely contemplated roles, and you will comply with applicable equal-opportunity, anti-discrimination, and data-protection laws (including the UK GDPR).</li>
              <li>You will not export, scrape, resell or redistribute Candidate profile data outside of your authorised use of AVANA Recruit.</li>
              <li>Hiring decisions are made by you. AVANA does not make, and is not responsible for, hiring outcomes.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "#1a2035" }}>5. AI Match Scoring</h2>
            <p>
              AVANA Recruit uses artificial intelligence to score Matches across multiple weighted dimensions (such as skills, experience, salary fit, location, availability and work authorisation). You acknowledge that:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>Match scores are produced algorithmically from data provided by Candidates and Companies and are intended as guidance only.</li>
              <li>Match scores are not a guarantee of fit, qualification, performance or any hiring outcome.</li>
              <li>No solely automated decisions with legal or similarly significant effects are made about Candidates. Final hiring, interview, rejection and offer decisions remain with the Company and must always involve appropriate human review.</li>
              <li>Candidates may request a human review of any AI-generated assessment that materially affects them.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "#1a2035" }}>6. Bias and Fairness</h2>
            <p>
              AVANA designs Recruit to support bias-aware hiring. Match scoring is based on role-relevant criteria; we do not use protected characteristics (such as race, gender, religion, disability, age, sexual orientation or marital status) as inputs to score generation. Companies remain responsible for the lawfulness and fairness of their own hiring practices, including any human filtering or selection performed within the platform.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "#1a2035" }}>7. Employment Verification</h2>
            <p>
              AVANA Recruit allows Candidates to request employment-history verifications from nominated Verifiers. AVANA acts solely as a facilitator: we deliver the request, collect the response and make it visible to the Candidate (and, where the Candidate authorises, to Companies considering them).
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>Candidates are responsible for ensuring they have an appropriate basis (including any necessary consent or notification) for nominating a Verifier.</li>
              <li>Verifiers are responsible for the accuracy and lawfulness of the information they provide.</li>
              <li>AVANA does not independently verify the truth of any employment claim and is not liable for inaccuracies in Verifier responses.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "#1a2035" }}>8. Candidate Personal Data</h2>
            <p>
              Where AVANA processes Candidate personal data on a Company's instructions (for example, when a Candidate is added to a Company's pipeline or shortlist), AVANA acts as a Data Processor and the Company acts as the Data Controller, subject to a Data Processing Agreement. The collection and use of personal data through AVANA Recruit is described in the <a href="/privacy-policy" style={{ color: "#4CAF50" }}>AVANA Recruit Privacy Policy</a>, which forms part of these Recruit Terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "#1a2035" }}>9. Other Terms (Defer to Master)</h2>
            <p>
              All other matters — including account registration, acceptable use, intellectual property, Customer Content licence, fees and payment, limitation of liability, termination, changes to terms and governing law — are governed by the master AVANA Terms and Conditions. Please read them in conjunction with this document.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "#1a2035" }}>10. Contact Us</h2>
            <p>If you have any questions about these Recruit Terms, please contact us at:</p>
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
