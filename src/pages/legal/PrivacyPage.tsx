import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function PrivacyPage() {
  return (
    <div className="min-h-dvh bg-white">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-[#6B7280] hover:text-[#0B0F19] mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>
        
        <h1 className="text-3xl font-bold text-[#0B0F19] mb-8">Privacy Policy</h1>
        
        <div className="prose prose-slate max-w-none">
          <p className="text-[#6B7280]">Last updated: January 2024</p>
          
          <h2 className="text-xl font-semibold text-[#0B0F19] mt-8 mb-4">1. Information We Collect</h2>
          <p className="text-[#6B7280]">
            We collect information you provide directly to us, including your name, email address, 
            and social media account information when you connect your platforms. We also collect 
            usage data and analytics to improve our service.
          </p>

          <h2 className="text-xl font-semibold text-[#0B0F19] mt-8 mb-4">2. How We Use Your Information</h2>
          <p className="text-[#6B7280]">
            We use your information to provide and improve our services, process transactions, 
            send notifications, and comply with legal obligations. We analyze your content and 
            audience data to provide insights and recommendations.
          </p>

          <h2 className="text-xl font-semibold text-[#0B0F19] mt-8 mb-4">3. Data Storage and Security</h2>
          <p className="text-[#6B7280]">
            We implement industry-standard security measures to protect your data. Your information 
            is stored on secure servers with encryption. We offer a local-first data vault option 
            for users who prefer to keep their data on their own devices.
          </p>

          <h2 className="text-xl font-semibold text-[#0B0F19] mt-8 mb-4">4. Data Sharing</h2>
          <p className="text-[#6B7280]">
            We do not sell your personal information to third parties. We may share data with 
            service providers who assist in operating our platform, subject to confidentiality 
            agreements. We may also disclose information when required by law.
          </p>

          <h2 className="text-xl font-semibold text-[#0B0F19] mt-8 mb-4">5. Your Rights</h2>
          <p className="text-[#6B7280]">
            You have the right to access, correct, or delete your personal information. You can 
            export your data at any time from your account settings. To request deletion of your 
            account and data, please contact our support team.
          </p>

          <h2 className="text-xl font-semibold text-[#0B0F19] mt-8 mb-4">6. Cookies and Tracking</h2>
          <p className="text-[#6B7280]">
            We use cookies and similar technologies to enhance your experience, analyze usage, 
            and improve our services. You can control cookie preferences through your browser settings.
          </p>

          <h2 className="text-xl font-semibold text-[#0B0F19] mt-8 mb-4">7. Third-Party Services</h2>
          <p className="text-[#6B7280]">
            Our service integrates with third-party social media platforms. Your use of these 
            integrations is subject to the respective platforms&apos; privacy policies and terms.
          </p>

          <h2 className="text-xl font-semibold text-[#0B0F19] mt-8 mb-4">8. Changes to This Policy</h2>
          <p className="text-[#6B7280]">
            We may update this Privacy Policy from time to time. We will notify you of any 
            significant changes via email or through our platform.
          </p>

          <h2 className="text-xl font-semibold text-[#0B0F19] mt-8 mb-4">9. Contact Us</h2>
          <p className="text-[#6B7280]">
            If you have questions about this Privacy Policy, please contact us at privacy@veloctiq.com
          </p>
        </div>
      </div>
    </div>
  );
}
