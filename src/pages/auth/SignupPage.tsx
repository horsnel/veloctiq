import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export function SignupPage() {
  const navigate = useNavigate();
  const { signup, isLoading } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(false);

  const getPasswordStrength = (pwd: string): { strength: number; label: string; color: string } => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[^a-zA-Z0-9]/.test(pwd)) score++;

    if (score <= 2) return { strength: 33, label: 'Weak', color: '#EF4444' };
    if (score === 3) return { strength: 50, label: 'Fair', color: '#F59E0B' };
    if (score === 4) return { strength: 75, label: 'Good', color: '#00D4AA' };
    return { strength: 100, label: 'Strong', color: '#00D4AA' };
  };

  const passwordStrength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    if (!agreeTerms) {
      toast.error('Please agree to the Terms of Service');
      return;
    }

    const success = await signup(email, password, name);
    if (success) {
      toast.success('Account created successfully!');
      navigate('/onboarding');
    } else {
      toast.error('Failed to create account');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F6F7F9] p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-[#00D4AA] flex items-center justify-center">
              <span className="text-white font-bold text-lg">V</span>
            </div>
            <span className="font-semibold text-[#0B0F19] text-xl">VELOCTIQ</span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-[#0B0F19] mb-2">Create your account</h1>
            <p className="text-sm text-[#6B7280]">Start your journey to smarter content</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-[#0B0F19]">
                Full name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 border-[#E5E7EB] focus:border-[#00D4AA] focus:ring-[#00D4AA]/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-[#0B0F19]">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 border-[#E5E7EB] focus:border-[#00D4AA] focus:ring-[#00D4AA]/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-[#0B0F19]">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 border-[#E5E7EB] focus:border-[#00D4AA] focus:ring-[#00D4AA]/20 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#0B0F19]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-[#6B7280]">Password strength</span>
                    <span style={{ color: passwordStrength.color }}>{passwordStrength.label}</span>
                  </div>
                  <div className="h-1.5 bg-[#F6F7F9] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${passwordStrength.strength}%`, backgroundColor: passwordStrength.color }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-2">
                <Checkbox
                  id="terms"
                  checked={agreeTerms}
                  onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
                  className="mt-0.5"
                />
                <Label htmlFor="terms" className="text-sm text-[#6B7280] cursor-pointer leading-relaxed">
                  I agree to the{' '}
                  <Link to="/terms" className="text-[#00D4AA] hover:underline">Terms of Service</Link>
                  {' '}and{' '}
                  <Link to="/privacy" className="text-[#00D4AA] hover:underline">Privacy Policy</Link>
                </Label>
              </div>
              <div className="flex items-start gap-2">
                <Checkbox
                  id="marketing"
                  checked={agreeMarketing}
                  onCheckedChange={(checked) => setAgreeMarketing(checked as boolean)}
                  className="mt-0.5"
                />
                <Label htmlFor="marketing" className="text-sm text-[#6B7280] cursor-pointer leading-relaxed">
                  Send me updates about new features and creator tips (optional)
                </Label>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-[#00D4AA] hover:bg-[#00D4AA]/90 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-[#6B7280]">
              Already have an account?{' '}
              <Link to="/login" className="text-[#00D4AA] hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-[#6B7280]">
          <p>Protected by industry-standard encryption</p>
        </div>
      </div>
    </div>
  );
}
