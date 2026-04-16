import { Link } from 'react-router-dom';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

export function LiminalConsentPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-[#6B7280] hover:text-[#0B0F19] mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>
        
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-[#7C3AED]/10 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-[#7C3AED]" />
          </div>
          <h1 className="text-3xl font-bold text-[#0B0F19]">Liminal Consent</h1>
        </div>
        
        <div className="prose prose-slate max-w-none">
          <div className="p-6 rounded-xl bg-amber-50 border border-amber-200 mb-8">
            <h2 className="text-lg font-semibold text-amber-800 mb-2">Psychological Risk Disclosure</h2>
            <p className="text-amber-700">
              Liminal features analyze deep psychological patterns and may reveal uncomfortable truths 
              about your content, audience, and mental state. Please read this disclosure carefully 
              before opting in.
            </p>
          </div>
          
          <h2 className="text-xl font-semibold text-[#0B0F19] mt-8 mb-4">What Are Liminal Features?</h2>
          <p className="text-[#6B7280]">
            Liminal features are advanced analytics tools that go beyond surface-level metrics to 
            analyze psychological patterns in your content and audience behavior. These features 
            include:
          </p>
          <ul className="list-disc list-inside text-[#6B7280] space-y-2">
            <li><strong>Dopamine Debt Analysis:</strong> Measures your psychological dependence on engagement metrics</li>
            <li><strong>Comment Archaeology:</strong> Uncovers hidden patterns and sentiments in historical comments</li>
            <li><strong>Voice Crack Detection:</strong> Analyzes vocal stress and emotional states in your content</li>
            <li><strong>Last Video Syndrome:</strong> Predicts creator burnout and mental health risks</li>
            <li><strong>Parasocial Intimacy Leak Detection:</strong> Identifies unhealthy audience relationships</li>
            <li><strong>Content Seance:</strong> Analyzes deleted or hidden content for insights</li>
          </ul>

          <h2 className="text-xl font-semibold text-[#0B0F19] mt-8 mb-4">Potential Risks</h2>
          <p className="text-[#6B7280]">
            By using Liminal features, you acknowledge and accept the following potential risks:
          </p>
          <ul className="list-disc list-inside text-[#6B7280] space-y-2">
            <li>Discovering uncomfortable truths about your content performance</li>
            <li>Learning about negative audience perceptions or behaviors</li>
            <li>Becoming aware of your own psychological dependencies and patterns</li>
            <li>Experiencing anxiety or distress from insights revealed</li>
            <li>Recognizing signs of burnout or mental health challenges</li>
          </ul>

          <h2 className="text-xl font-semibold text-[#0B0F19] mt-8 mb-4">Recommendations</h2>
          <p className="text-[#6B7280]">
            We strongly recommend the following when using Liminal features:
          </p>
          <ul className="list-disc list-inside text-[#6B7280] space-y-2">
            <li>Use these features when you are in a stable mental state</li>
            <li>Have a support system available if difficult insights are revealed</li>
            <li>Consider professional mental health support if needed</li>
            <li>Take breaks from analytics if you feel overwhelmed</li>
            <li>Remember that data is a tool, not a definition of your worth</li>
          </ul>

          <h2 className="text-xl font-semibold text-[#0B0F19] mt-8 mb-4">Your Consent</h2>
          <p className="text-[#6B7280]">
            By enabling Liminal features, you confirm that:
          </p>
          <ul className="list-disc list-inside text-[#6B7280] space-y-2">
            <li>You have read and understood this disclosure</li>
            <li>You understand the potential psychological risks involved</li>
            <li>You consent to the analysis of your psychological patterns</li>
            <li>You release VELOCTIQ from liability for any emotional distress</li>
            <li>You will seek professional help if needed</li>
          </ul>

          <h2 className="text-xl font-semibold text-[#0B0F19] mt-8 mb-4">Opting Out</h2>
          <p className="text-[#6B7280]">
            You can disable Liminal features at any time through your account settings. Disabling 
            Liminal will prevent access to these features but will not delete any previously generated 
            insights or reports.
          </p>

          <h2 className="text-xl font-semibold text-[#0B0F19] mt-8 mb-4">Contact</h2>
          <p className="text-[#6B7280]">
            If you have concerns about Liminal features or need support, please contact us at 
            support@veloctiq.com
          </p>
        </div>
      </div>
    </div>
  );
}
