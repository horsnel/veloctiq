import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, ChevronDown, ChevronUp, Copy } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface FeatureResultPanelProps {
  result: any;
  featureId?: string;
  featureName: string;
  source: string;
}

export function FeatureResultPanel({ result, featureName, source }: FeatureResultPanelProps) {
  const [expanded, setExpanded] = useState(true);

  if (!result) return null;

  const isSuccess = result.success !== false;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => toast.success('Copied to clipboard'));
  };

  const renderValue = (value: any, key: string = '', depth: number = 0): React.ReactNode => {
    if (value === null || value === undefined) return <span className="text-gray-400">null</span>;
    if (typeof value === 'boolean') return value ? <CheckCircle className="w-4 h-4 text-emerald-500 inline" /> : <XCircle className="w-4 h-4 text-red-500 inline" />;
    if (typeof value === 'number') {
      const isPercentage = key.toLowerCase().includes('score') || key.toLowerCase().includes('probability') || key.toLowerCase().includes('confidence');
      const isLarge = Math.abs(value) >= 1000;
      const display = isPercentage ? `${Math.round(value * 100) / 100}%` : isLarge ? value.toLocaleString() : value;
      return <span className={cn("font-mono", value > 70 ? "text-emerald-600" : value > 40 ? "text-amber-600" : "text-red-600")}>{display}</span>;
    }
    if (typeof value === 'string') {
      const isUrl = value.startsWith('http');
      if (isUrl) return <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline break-all">{value}</a>;
      if (value.length > 200) {
        return (
          <div className="relative group">
            <p className="text-sm text-gray-700 line-clamp-2">{value}</p>
            <button onClick={() => copyToClipboard(value)} className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded">
              <Copy className="w-3 h-3" />
            </button>
          </div>
        );
      }
      return <span className="text-sm text-gray-700">{value}</span>;
    }
    if (Array.isArray(value)) {
      if (value.length === 0) return <span className="text-gray-400 text-sm">Empty</span>;
      if (typeof value[0] === 'string' || typeof value[0] === 'number') {
        return (
          <div className="flex flex-wrap gap-1 mt-1">
            {value.map((item, i) => (
              <Badge key={i} variant="secondary" className="text-xs">{String(item)}</Badge>
            ))}
          </div>
        );
      }
      return (
        <div className="space-y-1 mt-1">
          {value.slice(0, 10).map((item, i) => (
            <div key={i} className={cn("p-2 rounded-lg bg-gray-50", depth > 0 && "ml-4")}>
              {typeof item === 'object' ? (
                <div className="space-y-1">
                  {Object.entries(item).map(([k, v]) => (
                    <div key={k} className="flex justify-between items-start gap-2">
                      <span className="text-xs text-gray-500 capitalize min-w-[120px]">{k.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <div className="text-right flex-1">{renderValue(v, k, depth + 1)}</div>
                    </div>
                  ))}
                </div>
              ) : (
                renderValue(item, String(i), depth + 1)
              )}
            </div>
          ))}
          {value.length > 10 && <p className="text-xs text-gray-400">...and {value.length - 10} more</p>}
        </div>
      );
    }
    if (typeof value === 'object') {
      const entries = Object.entries(value);
      if (entries.length === 0) return null;
      return (
        <div className="space-y-2 mt-2">
          {entries.map(([k, v]) => (
            <div key={k}>
              <div className="flex justify-between items-start gap-2">
                <span className="text-xs font-medium text-gray-500 capitalize min-w-[140px]">
                  {k.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim()}
                </span>
                <div className="flex-1 text-right">{renderValue(v, k, depth + 1)}</div>
              </div>
            </div>
          ))}
        </div>
      );
    }
    return String(value);
  };

  // Extract the main data payload
  const data = result.data || result;
  if (typeof data === 'string') {
    return (
      <Card className={cn("border", isSuccess ? "border-emerald-200 bg-emerald-50/30" : "border-red-200 bg-red-50/30")}>
        <CardContent className="p-4">
          <div className="flex items-start gap-2">
            {isSuccess ? <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5" /> : <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />}
            <p className="text-sm text-gray-700 flex-1">{data}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border", isSuccess ? "border-emerald-200" : "border-red-200")}>
      <CardHeader className="pb-2 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            {isSuccess ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <AlertTriangle className="w-4 h-4 text-red-500" />}
            {featureName} Result
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">{source}</Badge>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </CardHeader>
      {expanded && (
        <CardContent className="pt-0">
          <div className="space-y-3">
            {Object.entries(data).map(([key, value]) => (
              <div key={key} className="p-3 rounded-lg bg-gray-50/80">
                <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').replace(/^f\d+\s*/, '').trim()}
                </h4>
                {renderValue(value, key)}
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
