import logoUrl from "@assets/AVANA_Recruitment_1775997527320.png";
import { Link } from "wouter";

export default function Terms() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#ffffff" }}>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b" style={{ backgroundColor: "rgba(26, 32, 53, 0.97)", borderColor: "rgba(255,255,255,0.08)", backdropFilter: "blur(12px)" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-[72px] flex items-center justify-between">
          <Link href="/" className="cursor-pointer">
            <img src={logoUrl} alt="AVANA Recruitment" className="h-7" />
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 lg:px-10 pt-[120px] pb-20">
        <h1 className="text-3xl lg:text-4xl font-bold mb-2" style={{ color: "#1a2035" }}>Terms and Conditions</h1>
        <p className="text-sm mb-10" style={{ color: "#6b7280" }}>Last updated: April 2026</p>

        <div className="space-y-8 text-sm leading-relaxed" style={{ color: "#374151" }}>
          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "#1a2035" }}>1. Introduction</h2>
            <p>
              These Terms and Conditions ("Terms") govern your use of the AVANA Recruitment platform ("Platform"), operated by AVANA Services Limited, a company registered in England and Wales (Company Number: 15268633) ("we", "us", "our").
            </p>
            <p className="mt-3">
              By accessing or using our Platform, you agree to be bound by these Terms. If you do not agree to these Terms, you must not use the Platform.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "#1a2035" }}>2. Definitions</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>"Candidate"</strong> means any individual who creates an account on the Platform for the purpose of seeking employment opportunities.</li>
              <li><strong>"Company"</strong> means any organisation that creates an account on the Platform for the purpose of recruiting candidates.</li>
              <li><strong>"User"</strong> means any Candidate, Company, or other individual accessing the Platform.</li>
              <li><strong>"Services"</strong> means all services provided through the Platform, including AI-powered job matching, candidate profiling, employment verification, and related features.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "#1a2035" }}>3. Account Registration</h2>
            <p>To use certain features of the Platform, you must create an account. You agree to:</p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>Provide accurate, current, and complete information during registration.</li>
              <li>Maintain and promptly update your account information to keep it accurate and complete.</li>
              <li>Maintain the security and confidentiality of your login credentials.</li>
              <li>Accept responsibility for all activities that occur under your account.</li>
              <li>Notify us immediately of any unauthorised use of your account.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "#1a2035" }}>4. Use of the Platform</h2>
            <p>You agree to use the Platform only for lawful purposes and in accordance with these Terms. You must not:</p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>Use the Platform in any way that violates any applicable local, national, or international law or regulation.</li>
              <li>Submit false, misleading, or fraudulent information, including in candidate profiles, job listings, or employment verifications.</li>
              <li>Attempt to gain unauthorised access to any part of the Platform, other accounts, or any systems or networks connected to the Platform.</li>
              <li>Use automated tools, bots, or scripts to access or interact with the Platform without our prior written consent.</li>
              <li>Interfere with or disrupt the integrity or performance of the Platform.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "#1a2035" }}>5. AI Matching Services</h2>
            <p>
              Our Platform uses artificial intelligence to match candidates with job opportunities based on skills, experience, education, and location. You acknowledge and agree that:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>Match scores and assessments are generated algorithmically and are intended as guidance only.</li>
              <li>We do not guarantee the accuracy, completeness, or suitability of any match results.</li>
              <li>Hiring decisions remain the sole responsibility of the Company, and career decisions remain the sole responsibility of the Candidate.</li>
              <li>We are not liable for any decisions made based on AI-generated match results.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "#1a2035" }}>6. Employment Verification</h2>
            <p>
              The Platform provides an employment verification feature that allows Candidates to request third-party verification of their employment history. You acknowledge and agree that:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>We act solely as a facilitator of verification requests and do not independently verify any employment claims.</li>
              <li>Verification responses are provided by third parties and we make no representations as to their accuracy.</li>
              <li>Candidates are responsible for ensuring they have appropriate consent before requesting verification from any individual.</li>
              <li>Verifiers participate voluntarily and are responsible for the accuracy of their responses.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "#1a2035" }}>7. Data Protection and Privacy</h2>
            <p>
              We are committed to protecting your personal data in accordance with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018. By using the Platform, you acknowledge that:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>We collect and process personal data as necessary to provide our Services.</li>
              <li>Candidate profile information may be shared with Companies for the purpose of recruitment matching.</li>
              <li>Company information may be visible to Candidates browsing the Platform.</li>
              <li>We may send transactional emails related to your use of the Platform, including verification requests and contact form notifications.</li>
              <li>You have the right to request access to, correction of, or deletion of your personal data by contacting us.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "#1a2035" }}>8. Intellectual Property</h2>
            <p>
              All content, features, and functionality of the Platform, including but not limited to text, graphics, logos, icons, software, and the underlying AI matching algorithms, are the exclusive property of AVANA Services Limited and are protected by copyright, trademark, and other intellectual property laws.
            </p>
            <p className="mt-3">
              You may not reproduce, distribute, modify, create derivative works of, publicly display, or otherwise use any content from the Platform without our prior written permission.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "#1a2035" }}>9. Fees and Payment</h2>
            <p>
              Certain features of the Platform may be subject to fees as outlined in our pricing plans. By subscribing to a paid plan, you agree to pay the applicable fees. All fees are stated in British Pounds Sterling (£) and are exclusive of VAT unless otherwise stated.
            </p>
            <p className="mt-3">
              We reserve the right to change our fees at any time. Any fee changes will be communicated to you in advance and will apply from the next billing cycle.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "#1a2035" }}>10. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, AVANA Services Limited shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or business opportunities, arising out of or in connection with your use of the Platform.
            </p>
            <p className="mt-3">
              Our total liability to you for any claims arising from or related to these Terms or your use of the Platform shall not exceed the total fees paid by you to us in the twelve (12) months preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "#1a2035" }}>11. Termination</h2>
            <p>
              We may terminate or suspend your access to the Platform at any time, without prior notice or liability, for any reason, including if you breach these Terms. Upon termination, your right to use the Platform will immediately cease.
            </p>
            <p className="mt-3">
              You may terminate your account at any time by contacting us. Termination does not relieve you of any obligations incurred prior to termination.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "#1a2035" }}>12. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. We will notify Users of any material changes by posting the updated Terms on the Platform with a revised "Last updated" date. Your continued use of the Platform after any changes constitutes acceptance of the updated Terms.
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
              <p className="mt-2">
                Email: <a href="mailto:enquiries@avanaservices.com" style={{ color: "#4CAF50" }}>enquiries@avanaservices.com</a>
              </p>
              <p className="mt-1">
                Or use our <Link href="/contact-us" style={{ color: "#4CAF50" }}>Contact Us</Link> form.
              </p>
            </div>
          </section>
        </div>
      </div>

      <footer style={{ backgroundColor: "#1a2035", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <img src={logoUrl} alt="AVANA Recruitment" className="h-6" />
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
