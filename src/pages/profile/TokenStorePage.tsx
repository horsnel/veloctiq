import { useState } from 'react';
import { useTokenStore, tokenPackages } from '@/stores';
import { formatVQT, formatNaira } from '@/lib/utils';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Coins, CreditCard, Smartphone, Building2 } from 'lucide-react';

export function TokenStorePage() {
  const { balance, addTokens, transactions } = useTokenStore();
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePurchase = async () => {
    if (!selectedPackage) {
      toast.error('Please select a package');
      return;
    }

    setIsProcessing(true);
    
    // Simulate Paystack payment
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const pkg = tokenPackages.find(p => p.id === selectedPackage);
    if (pkg) {
      const bonusAmount = Math.floor(pkg.vqtAmount * (pkg.bonus / 100));
      const totalAmount = pkg.vqtAmount + bonusAmount;
      addTokens(totalAmount, `Purchased ${pkg.name} package`);
      toast.success(`Successfully purchased ${formatVQT(totalAmount)}!`);
      setSelectedPackage(null);
    }
    
    setIsProcessing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0B0F19]">Token Store</h1>
          <p className="text-sm text-[#6B7280]">Purchase VQT tokens to use features</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-[#00D4AA]/10 rounded-xl">
          <Coins className="w-5 h-5 text-[#00D4AA]" />
          <span className="font-semibold text-[#00D4AA]">{formatVQT(balance)}</span>
        </div>
      </div>

      <Tabs defaultValue="purchase" className="space-y-6">
        <TabsList className="bg-[#F6F7F9]">
          <TabsTrigger value="purchase">Purchase</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="purchase" className="space-y-6">
          {/* Current Balance */}
          <Card className="border-[#E5E7EB] bg-gradient-to-r from-[#00D4AA]/5 to-transparent">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#6B7280] mb-1">Current Balance</p>
                  <p className="text-3xl font-bold text-[#0B0F19]">{formatVQT(balance)}</p>
                  <p className="text-sm text-[#6B7280]">≈ {formatNaira(balance * 10)}</p>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-[#00D4AA]/10 flex items-center justify-center">
                  <Coins className="w-8 h-8 text-[#00D4AA]" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Packages */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {tokenPackages.map((pkg) => (
              <div
                key={pkg.id}
                onClick={() => setSelectedPackage(pkg.id)}
                className={`
                  relative p-4 rounded-xl border-2 cursor-pointer transition-all
                  ${selectedPackage === pkg.id
                    ? 'border-[#00D4AA] bg-[#00D4AA]/5'
                    : 'border-[#E5E7EB] hover:border-[#00D4AA]/50'
                  }
                `}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-[#00D4AA] text-white border-none text-xs">Most Popular</Badge>
                  </div>
                )}
                {pkg.bonus > 0 && (
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-[#F59E0B]/10 text-[#F59E0B] border-none text-xs">
                      +{pkg.bonus}%
                    </Badge>
                  </div>
                )}
                <div className="text-center pt-2">
                  <h3 className="font-semibold text-[#0B0F19] mb-1">{pkg.name}</h3>
                  <p className="text-2xl font-bold text-[#00D4AA]">{pkg.vqtAmount.toLocaleString()}</p>
                  <p className="text-sm text-[#6B7280] mb-3">VQT</p>
                  <p className="text-lg font-semibold text-[#0B0F19]">
                    {formatNaira(pkg.nairaPrice)}
                  </p>
                </div>
                {selectedPackage === pkg.id && (
                  <div className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-[#00D4AA] flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Payment Methods */}
          {selectedPackage && (
            <Card className="border-[#E5E7EB]">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-[#0B0F19]">Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-3 gap-4 mb-6">
                  <div className="flex items-center gap-3 p-4 rounded-xl border border-[#00D4AA] bg-[#00D4AA]/5">
                    <CreditCard className="w-5 h-5 text-[#00D4AA]" />
                    <span className="font-medium text-[#0B0F19]">Card</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-xl border border-[#E5E7EB]">
                    <Smartphone className="w-5 h-5 text-[#6B7280]" />
                    <span className="text-[#6B7280]">USSD</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-xl border border-[#E5E7EB]">
                    <Building2 className="w-5 h-5 text-[#6B7280]" />
                    <span className="text-[#6B7280]">Bank Transfer</span>
                  </div>
                </div>
                <Button
                  className="w-full bg-[#00D4AA] hover:bg-[#00D4AA]/90 text-white h-12"
                  onClick={handlePurchase}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    `Pay ${formatNaira(tokenPackages.find(p => p.id === selectedPackage)?.nairaPrice || 0)}`
                  )}
                </Button>
                <p className="text-center text-xs text-[#6B7280] mt-3">
                  Secured by Paystack • 1 VQT = ₦10
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card className="border-[#E5E7EB]">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[#0B0F19]">Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transactions.length === 0 ? (
                  <p className="text-center text-[#6B7280] py-8">No transactions yet</p>
                ) : (
                  transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-[#F6F7F9]"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`
                          w-10 h-10 rounded-lg flex items-center justify-center
                          ${tx.type === 'purchase' ? 'bg-[#00D4AA]/10' : 
                            tx.type === 'spend' ? 'bg-[#EF4444]/10' : 'bg-[#F59E0B]/10'}
                        `}>
                          <Coins className={`w-5 h-5 ${
                            tx.type === 'purchase' ? 'text-[#00D4AA]' : 
                            tx.type === 'spend' ? 'text-[#EF4444]' : 'text-[#F59E0B]'
                          }`} />
                        </div>
                        <div>
                          <p className="font-medium text-[#0B0F19]">{tx.description}</p>
                          <p className="text-xs text-[#6B7280]">
                            {new Date(tx.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span className={`font-semibold ${
                        tx.amount > 0 ? 'text-[#00D4AA]' : 'text-[#EF4444]'
                      }`}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount} VQT
                      </span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
