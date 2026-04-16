import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function CookiesPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-[#6B7280] hover:text-[#0B0F19] mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>
        
        <h1 className="text-3xl font-bold text-[#0B0F19] mb-8">Cookie Policy</h1>
        
        <div className="prose prose-slate max-w-none">
          <p className="text-[#6B7280]">Last updated: January 2024</p>
          
          <h2 className="text-xl font-semibold text-[#0B0F19] mt-8 mb-4">What Are Cookies</h2>
          <p className="text-[#6B7280]">
            Cookies are small text files that are stored on your device when you visit a website. 
            They are widely used to make websites work more efficiently and provide information 
            to the website owners.
          </p>

          <h2 className="text-xl font-semibold text-[#0B0F19] mt-8 mb-4">How We Use Cookies</h2>
          <p className="text-[#6B7280]">
            VELOCTIQ uses cookies for the following purposes:
          </p>
          <ul className="list-disc list-inside text-[#6B7280] space-y-2">
            <li><strong>Essential cookies:</strong> Required for the website to function properly</li>
            <li><strong>Preference cookies:</strong> Remember your settings and preferences</li>
            <li><strong>Analytics cookies:</strong> Help us understand how visitors interact with our site</li>
            <li><strong>Security cookies:</strong> Help protect your account and our platform</li>
          </ul>

          <h2 className="text-xl font-semibold text-[#0B0F19] mt-8 mb-4">Managing Cookies</h2>
          <p className="text-[#6B7280]">
            Most web browsers allow you to control cookies through their settings. You can choose 
            to accept or reject cookies, or to be notified when a cookie is being sent. Please note 
            that disabling cookies may affect the functionality of our website.
          </p>

          <h2 className="text-xl font-semibold text-[#0B0F19] mt-8 mb-4">Third-Party Cookies</h2>
          <p className="text-[#6B7280]">
            We may use third-party services that set their own cookies. These include analytics 
            providers and payment processors. These third parties have their own privacy and cookie policies.
          </p>

          <h2 className="text-xl font-semibold text-[#0B0F19] mt-8 mb-4">Changes to This Policy</h2>
          <p className="text-[#6B7280]">
            We may update this Cookie Policy from time to time. Any changes will be posted on this page.
          </p>

          <h2 className="text-xl font-semibold text-[#0B0F19] mt-8 mb-4">Contact Us</h2>
          <p className="text-[#6B7280]">
            If you have questions about our use of cookies, please contact us at privacy@veloctiq.com
          </p>
        </div>
      </div>
    </div>
  );
}
