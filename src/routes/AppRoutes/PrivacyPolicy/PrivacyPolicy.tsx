import { Link } from 'react-router-dom';

import styles from './privacyPolicy.module.css';

const PrivacyPolicy = () => {
  return (
    <div className={styles.pageStyles}>
      <div className={styles.back}>
        <Link to={'/'} className={styles.backButton}>
          Home
        </Link>
      </div>
      <main className={styles.mainContent}>
        <div>
          <h2 className={styles.title}>Privacy Policy for TripAmi Inc.</h2>
          <p className={styles.effectiveDate}>Effective Date: November 1st 2024</p>
          <p className={styles.headerDescription}>
            At TripAmi Inc., we are committed to protecting your privacy. This Privacy Policy
            outlines how we collect, use, disclose, and safeguard your information when you visit
            our website{' '}
            <a href='https://tripami.com' target='_blank' rel='noopener noreferrer'>
              https://tripami.com
            </a>{' '}
            and use our services (collectively, the “Services”). By using our Services, you agree to
            the terms outlined in this policy.
          </p>
          <div className={styles.contentSection}>
            <div className={styles.subSection}>
              <h3>1. Information We Collect Personal Information</h3>
              <p>
                We may collect personal information that you provide directly to us, such as your
                name, email address, phone number, billing information, and any other information
                you choose to provide. Usage Data: We may collect information about your use of the
                Site, including IP address, browser type, operating system, referring URLs, pages
                visited, location data, and device identifiers. Cookies and Tracking Technologies:
                We use cookies and similar tracking technologies to enhance your experience, gather
                general visitor information, and track usage patterns on our Site.
              </p>
            </div>
            <div>
              <h3>
                2. How We Use Your Information We use the information we collect for various
                purposes, including
              </h3>
              <ul>
                <li>
                  To provide and maintain our Services – enabling functionality, managing user
                  accounts, and processing payments.
                </li>
                <li>
                  To communicate with you – sending important notifications, updates, or promotional
                  offers.
                </li>
                <li>
                  To improve our Services – analyzing trends, usage, and user interactions to
                  enhance our offerings.
                </li>
                <li>
                  For security purposes – detecting and preventing fraud and safeguarding the Site
                  and users.
                </li>
              </ul>
            </div>
            <div>
              <h3>3. How We Share Your Information Service Providers</h3>
              <p>
                We may share your information with third-party vendors, service providers, and
                business partners who help us operate and maintain our Services. Legal Requirements:
                We may disclose your information if required to do so by law or in response to valid
                legal requests from government authorities (e.g., court orders, subpoenas). Business
                Transfers: If TripAmi Inc. is involved in a merger, acquisition, or asset sale, your
                information may be transferred. We will provide notice before your personal data is
                transferred and becomes subject to a different Privacy Policy.
              </p>
            </div>
            <div>
              <h3>4. Data Security</h3>
              <p>
                We implement appropriate technical and organizational security measures to protect
                your personal information. However, please note that no transmission of data over
                the internet is completely secure, and we cannot guarantee the absolute security of
                your information.
              </p>
            </div>
            <div>
              <h3>5. Your Privacy Rights Access, Correction, Deletion</h3>
              <p>
                You have the right to access, correct, or request deletion of your personal
                information. Contact us at
                <a href='mailto:support@tripami.com' /> to exercise these rights. Opt-Out of
                Marketing Communications: You can opt out of receiving marketing emails by following
                the unsubscribe link in our emails or by contacting us directly.
              </p>
            </div>
            <div>
              <h3>6. Third-Party Links</h3>
              <p>
                Our Site may contain links to third-party websites. We are not responsible for the
                privacy practices of these sites, and we encourage you to review their privacy
                policies.
              </p>
            </div>
            <div>
              <h3>7. Children&rsquo;s Privacy</h3>
              <p>
                Our Services are not intended for individuals under the age of 13. We do not
                knowingly collect personal information from children under 13. If we become aware
                that we have inadvertently collected such data, we will take steps to delete it
                promptly.
              </p>
            </div>
            <div>
              <h3>8. Changes to This Privacy Policy</h3>
              <p>
                We may update this Privacy Policy from time to time. When we do, we will notify you
                by posting the updated policy on our Site and updating the effective date. Your
                continued use of our Services after any changes signifies your acceptance of the
                updated policy.
              </p>
            </div>
            <div>
              <h3>9. Contact Us</h3>
              <p>
                If you have any questions or concerns about this Privacy Policy, please contact us
                at:
              </p>
              <ul>
                <li>
                  <a href='https://tripami.com' target='_blank' rel='noopener noreferrer'>
                    TripAmi Inc
                  </a>
                </li>
                <li>
                  Email:{' '}
                  <a href='mailto:support@tripami.com' target='_blank'>
                    support@tripami.com
                  </a>
                </li>
                <li>
                  Address:{' '}
                  <a
                    href='https://www.google.com/maps?q=234+Guildford+Ct.,+West+Hempstead,+NY,+United+States,+New+York'
                    target='_blank'
                  >
                    234 Guildford Ct., West Hempstead, NY, United States, New York
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      <footer className={styles.footer}>
        <p>© {new Date().getFullYear()} TripAmi Inc. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default PrivacyPolicy;
