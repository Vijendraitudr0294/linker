import InfoPageLayout from "@/components/InfoPageLayout";

const PrivacyPolicy = () => (
  <InfoPageLayout title="Privacy Policy" subtitle="Your privacy is important to us." lastUpdated="March 29, 2026">
    <h2>1. Information We Collect</h2>
    <p>We collect information you provide directly, such as when you create an account, update your profile, or contact us. This includes:</p>
    <ul>
      <li>Name, email address, and username</li>
      <li>Profile information (bio, avatar, social links)</li>
      <li>Content you create (links, catalog items, messages)</li>
      <li>Usage data and analytics (page views, link clicks)</li>
    </ul>

    <h2>2. How We Use Your Information</h2>
    <p>We use the information we collect to:</p>
    <ul>
      <li>Provide, maintain, and improve our services</li>
      <li>Create and manage your account</li>
      <li>Process transactions and send related notifications</li>
      <li>Send technical notices, updates, and support messages</li>
      <li>Respond to your comments, questions, and requests</li>
      <li>Monitor and analyze trends, usage, and activities</li>
    </ul>

    <h2>3. Information Sharing</h2>
    <p>We do not sell your personal information. We may share your information only in the following circumstances:</p>
    <ul>
      <li>With your consent or at your direction</li>
      <li>With service providers who assist in our operations</li>
      <li>To comply with legal obligations</li>
      <li>To protect the rights and safety of BIOTRA and our users</li>
    </ul>

    <h2>4. Data Security</h2>
    <p>We implement industry-standard security measures to protect your data, including encryption in transit and at rest, regular security audits, and access controls. However, no method of transmission over the Internet is 100% secure.</p>

    <h2>5. Your Rights</h2>
    <p>You have the right to access, update, or delete your personal information at any time through your account settings. You may also request a copy of your data or ask us to restrict processing.</p>

    <h2>6. Cookies</h2>
    <p>We use essential cookies to maintain your session and preferences. We do not use third-party tracking cookies or advertising cookies. See our Cookie Policy for more details.</p>

    <h2>7. Contact Us</h2>
    <p>If you have questions about this Privacy Policy, please contact us at privacy@biotra.ai.</p>
  </InfoPageLayout>
);

export default PrivacyPolicy;
