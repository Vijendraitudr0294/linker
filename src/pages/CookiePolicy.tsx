import InfoPageLayout from "@/components/InfoPageLayout";

const CookiePolicy = () => (
  <InfoPageLayout title="Cookie Policy" subtitle="How we use cookies to improve your experience." lastUpdated="March 1, 2026">
    <h2>What Are Cookies?</h2>
    <p>Cookies are small text files stored on your device when you visit a website. They help us remember your preferences and improve your experience.</p>

    <h2>Cookies We Use</h2>

    <h3>Essential Cookies</h3>
    <p>These cookies are necessary for the platform to function and cannot be disabled. They include:</p>
    <ul>
      <li><strong>Authentication cookies</strong> — keep you logged in</li>
      <li><strong>Session cookies</strong> — maintain your session state</li>
      <li><strong>Security cookies</strong> — prevent cross-site request forgery</li>
    </ul>

    <h3>Functional Cookies</h3>
    <p>These remember your preferences:</p>
    <ul>
      <li><strong>Theme preference</strong> — light or dark mode</li>
      <li><strong>Language preference</strong> — your selected language</li>
    </ul>

    <h2>Cookies We Do NOT Use</h2>
    <ul>
      <li>Third-party advertising cookies</li>
      <li>Social media tracking pixels</li>
      <li>Cross-site tracking cookies</li>
      <li>Analytics cookies from third parties</li>
    </ul>
    <p>We believe in privacy-first analytics. Our built-in analytics track page views and link clicks without using any third-party cookies or tracking scripts.</p>

    <h2>Managing Cookies</h2>
    <p>You can control cookies through your browser settings. Note that disabling essential cookies may affect the functionality of BIOTRA.</p>

    <h2>Contact</h2>
    <p>Questions about our cookie practices? Email us at privacy@BIOTRA.com.</p>
  </InfoPageLayout>
);

export default CookiePolicy;
