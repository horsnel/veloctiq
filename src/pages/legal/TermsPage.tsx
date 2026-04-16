import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function TermsPage() {
  return (
    <div className="min-h-dvh bg-white">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-[#6B7280] hover:text-[#0B0F19] mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>
        
        <h1 className="text-3xl font-bold text-[#0B0F19] mb-8">Terms of Service</h1>
        
        <div className="prose prose-slate max-w-none">
          <p className="text-[#6B7280]">Last updated: January 2024</p>
          
          <h2 className="text-xl font-semibold text-[#0B0F19] mt-8 mb-4">1. Acceptance of Terms</h2>
          <p className="text-[#6B7280]">
            By accessing or using VELOCTIQ, you agree to be bound by these Terms of Service. 
            If you do not agree to these terms, please do not use our service.
          </p>

          <h2 className="text-xl font-semibold text-[#0B0F19] mt-8 mb-4">2. Description of Service</h2>
          <p className="text-[#6B7280]">
            VELOCTIQ is a social media intelligence platform that provides creators and brands 
            with tools for content protection, audience analysis, revenue optimization, and more. 
            Our services are provided on a pay-per-use basis using VQT tokens.
          </p>

          <h2 className="text-xl font-semibold text-[#0B0F19] mt-8 mb-4">3. User Accounts</h2>
          <p className="text-[#6B7280]">
            You are responsible for maintaining the confidentiality of your account credentials 
            and for all activities that occur under your account. You agree to notify us immediately 
            of any unauthorized use of your account.
          </p>

          <h2 className="text-xl font-semibold text-[#0B0F19] mt-8 mb-4">4. Token Economy</h2>
          <p className="text-[#6B7280]">
            VELOCTIQ operates on a token-based system. 1 VQT = ₦10 (Nigerian Naira). Tokens are 
            non-refundable and non-transferable. Features consume tokens when used. Free features 
            are marked as such and do not consume tokens.
          </p>

          <h2 className="text-xl font-semibold text-[#0B0F19] mt-8 mb-4">5. Acceptable Use</h2>
          <p className="text-[#6B7280]">
            You agree not to use VELOCTIQ for any unlawful purpose or in any way that could damage, 
            disable, overburden, or impair our service. You may not attempt to gain unauthorized 
            access to any part of our system.
          </p>

          <h2 className="text-xl font-semibold text-[#0B0F19] mt-8 mb-4">6. Data and Privacy</h2>
          <p className="text-[#6B7280]">
            Your use of VELOCTIQ is also governed by our Privacy Policy. By using our service, 
            you consent to the collection and use of your data as described in the Privacy Policy.
          </p>

          <h2 className="text-xl font-semibold text-[#0B0F19] mt-8 mb-4">7. Limitation of Liability</h2>
          <p className="text-[#6B7280]">
            VELOCTIQ is provided &quot;as is&quot; without warranties of any kind. We are not liable for 
            any damages arising from your use of our service, including but not limited to direct, 
            indirect, incidental, or consequential damages.
          </p>

          <h2 className="text-xl font-semibold text-[#0B0F19] mt-8 mb-4">8. Changes to Terms</h2>
          <p className="text-[#6B7280]">
            We reserve the right to modify these terms at any time. Continued use of VELOCTIQ 
            after changes constitutes acceptance of the new terms.
          </p>

          <h2 className="text-xl font-semibold text-[#0B0F19] mt-8 mb-4">9. Contact</h2>
          <p className="text-[#6B7280]">
            For questions about these terms, please contact us at support@veloctiq.com
          </p>
        </div>
      </div>
    </div>
  );
}
