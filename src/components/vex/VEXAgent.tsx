import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTokenStore, useFeatureStore, useUIStore, useAuthStore } from '@/stores';
import { aiService } from '@/services/AIService';
import { webLLMService } from '@/services/WebLLMService';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn, formatVQT } from '@/lib/utils';
import { 
  Bot, 
  X, 
  Mic, 
  MicOff,
  Send, 
  Minimize2,
  Maximize2,
  Sparkles,
  Coins,
  Cpu,
  Wifi,
  WifiOff,
  MessageSquare
} from 'lucide-react';

// ============================================================
// SpeechRecognition TypeScript Interfaces
// ============================================================
interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
  onaudiostart: (() => void) | null;
  onaudioend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface Message {
  id: string;
  role: 'user' | 'vex';
  content: string;
  timestamp: string;
  actions?: { label: string; action: () => void }[];
  aiSource?: 'groq' | 'browser' | 'webllm' | 'cache' | 'fallback';
}

// Command mapping for natural language
const commandMap: Record<string, string[]> = {
  'f1': ['check bots', 'bot detection', 'find bots', 'detect bots', 'behavioral bot'],
  'f2': ['toxic comment', 'check toxicity', 'toxic detection', 'hate speech'],
  'f3': ['sentiment', 'analyze sentiment', 'comment sentiment', 'audience mood'],
  'f4': ['shadow ban', 'am i shadow banned', 'check shadow ban', 'shadowban warning'],
  'f21': ['viral check', 'will this go viral', 'viral potential', 'viral signal', 'viral prediction'],
  'f22': ['hashtag', 'recommend hashtags', 'best hashtags', 'hashtag strategy'],
  'f36': ['roi forecast', 'revenue forecast', 'predict revenue', 'earnings prediction'],
  'f43': ['find sponsors', 'sponsor scan', 'sponsor inventory', 'sponsorship opportunities'],
  'f44': ['optimize content', 'content optimization', 'improve post', 'better caption'],
  'f45': ['competitor', 'analyze competitor', 'competitor analysis', 'spy on competitor'],
  'f66': ['write caption', 'ghostwriter', 'ai write', 'generate content'],
  'f82': ['thumbnail check', 'optimize thumbnail', 'thumbnail oracle'],
  'f98': ['channel health', 'health check', 'audit channel'],
  'f102': ['burnout check', 'am i burning out', 'last video syndrome'],
  'f108': ['burnout warning', 'burnout risk', 'creator burnout'],
};

interface VEXAgentProps {
  autoExpand?: boolean;
}

export function VEXAgent({ autoExpand = false }: VEXAgentProps) {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(autoExpand);
  const [isVisible, setIsVisible] = useState(true);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'vex',
      content: "Hello! I'm VEX, your AI content companion powered by browser-based intelligence. I can help you analyze content, detect bots, predict viral potential, and optimize your strategy - all running locally in your browser!",
      timestamp: new Date().toISOString(),
      actions: [
        { label: 'Check bots', action: () => executeFeature('f1') },
        { label: 'Viral check', action: () => executeFeature('f21') },
        { label: 'Find sponsors', action: () => executeFeature('f43') },
      ]
    }
  ]);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [finalTranscript, setFinalTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const autoSendTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [aiSource, setAiSource] = useState<'groq' | 'browser' | 'webllm' | 'cache' | 'fallback'>('browser');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { balance, spendTokens, getFreeAnalysesRemaining } = useTokenStore();
  const { getFeatureById } = useFeatureStore();
  const { notifications } = useUIStore();
  const { user } = useAuthStore();

  // Initialize AI service
  useEffect(() => {
    aiService.initialize();
  }, []);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Parse natural language command to feature ID
  const parseCommand = (text: string): string | null => {
    const lowerText = text.toLowerCase();
    
    for (const [featureId, phrases] of Object.entries(commandMap)) {
      for (const phrase of phrases) {
        if (lowerText.includes(phrase)) {
          return featureId;
        }
      }
    }
    
    // Check for compound commands
    if (lowerText.includes('and')) {
      const parts = lowerText.split('and');
      for (const part of parts) {
        const result = parseCommand(part.trim());
        if (result) return result;
      }
    }
    
    return null;
  };

  // Process AI-powered feature execution
  const processAIFeature = async (featureId: string, userInput?: string) => {
    setIsProcessing(true);
    
    try {
      let result: any = null;
      let source: 'groq' | 'browser' | 'webllm' | 'cache' | 'fallback' = 'browser';

      switch (featureId) {
        case 'f1': // Bot Detection
          const usernames = userInput?.match(/@\w+/g) || ['@user123', '@bot_account_2024', '@real_person'];
          const botResult = await aiService.detectBots(usernames.map(u => u.replace('@', '')));
          result = botResult.data;
          source = botResult.source === 'groq' ? 'groq' : botResult.source === 'cache' ? 'cache' : 'browser';
          break;

        case 'f2': // Toxicity Detection
          const text = userInput || 'Sample comment to analyze';
          const toxicResult = await aiService.detectToxicity(text);
          result = toxicResult.data;
          source = toxicResult.source === 'groq' ? 'groq' : toxicResult.source === 'cache' ? 'cache' : 'browser';
          break;

        case 'f3': // Sentiment Analysis
          const comments = userInput?.split('.') || ['Great post!', 'Love this content', 'Amazing work'];
          const sentimentResult = await aiService.analyzeSentiment(comments.filter(c => c.trim()));
          result = sentimentResult.data;
          source = sentimentResult.source === 'groq' ? 'groq' : sentimentResult.source === 'cache' ? 'cache' : 'browser';
          break;

        case 'f21': // Viral Prediction
          const content = userInput || 'Check out my new video!';
          const platform = userInput?.includes('instagram') ? 'instagram' : 
                          userInput?.includes('tiktok') ? 'tiktok' : 
                          userInput?.includes('youtube') ? 'youtube' : 'instagram';
          const viralResult = await aiService.predictViralPotential(content, platform);
          result = viralResult.data;
          source = viralResult.source === 'groq' ? 'groq' : viralResult.source === 'cache' ? 'cache' : 'browser';
          break;

        case 'f22': // Hashtag Recommendations
          const hashtagContent = userInput || 'fitness workout gym';
          const hashtagResult = await aiService.recommendHashtags(hashtagContent, 10);
          result = hashtagResult.data;
          source = hashtagResult.source === 'groq' ? 'groq' : hashtagResult.source === 'cache' ? 'cache' : 'browser';
          break;

        case 'f43': // Sponsor Matching
          const profile = {
            followers: 50000,
            engagement: 0.04,
            categories: ['fitness', 'lifestyle'],
          };
          const sponsorResult = await aiService.matchSponsors(profile);
          result = sponsorResult.data;
          source = sponsorResult.source === 'groq' ? 'groq' : sponsorResult.source === 'cache' ? 'cache' : 'browser';
          break;

        case 'f44': // Content Optimization
          const optContent = userInput || 'Check out my new post!';
          const optPlatform = userInput?.includes('instagram') ? 'instagram' : 'instagram';
          const optResult = await aiService.optimizeContent(optContent, optPlatform);
          result = optResult.data;
          source = optResult.source === 'groq' ? 'groq' : optResult.source === 'cache' ? 'cache' : 'browser';
          break;

        case 'f45': // Competitor Analysis
          const competitorContent = [
            'Amazing workout routine! #fitness #gym',
            'New PR today! So proud #fitnessmotivation',
            'What I eat in a day #healthylifestyle',
          ];
          const compResult = await aiService.analyzeCompetitor(competitorContent);
          result = compResult.data;
          source = compResult.source;
          break;

        default:
          // Use WebLLM for general queries
          const webLLMResult = await webLLMService.generateResponse(userInput || '');
          result = { response: webLLMResult.text };
          source = 'webllm';
      }

      return { result, source };
    } catch (error) {
      console.error('AI processing error:', error);
      // Fallback to WebLLM
      const fallback = await webLLMService.generateResponse(userInput || '');
      return { result: { response: fallback.text }, source: 'webllm' as const };
    } finally {
      setIsProcessing(false);
    }
  };

  const executeFeature = async (featureId: string, userInput?: string) => {
    const feature = getFeatureById(featureId);
    if (!feature) {
      toast.error('Feature not found');
      return;
    }

    // Check if free analysis available
    const freeRemaining = getFreeAnalysesRemaining();
    if (freeRemaining > 0 && feature.vqtCost <= 3) {
      const processingMsg: Message = {
        id: Date.now().toString(),
        role: 'vex',
        content: `Running ${feature.name} with AI analysis... (Free analysis used - ${freeRemaining - 1} remaining today)`,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, processingMsg]);

      // Process with AI
      const { result, source } = await processAIFeature(featureId, userInput);
      setAiSource(source);

      const resultMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'vex',
        content: formatAIResult(feature.name, result, source),
        timestamp: new Date().toISOString(),
        aiSource: source,
        actions: [
          { label: `View in ${feature.category}`, action: () => navigate(`/${feature.category}`) },
          { label: 'Run another', action: () => setInput('') },
        ]
      };
      setMessages(prev => [...prev, resultMsg]);
      
      return;
    }

    // Check token balance
    if (balance < feature.vqtCost) {
      const response: Message = {
        id: Date.now().toString(),
        role: 'vex',
        content: `You need ${feature.vqtCost} VQT to run ${feature.name}, but you only have ${balance} VQT. Would you like to purchase more tokens?`,
        timestamp: new Date().toISOString(),
        actions: [
          { label: 'Buy VQT', action: () => navigate('/tokens') },
          { label: 'Maybe later', action: () => {} },
        ]
      };
      setMessages(prev => [...prev, response]);
      return;
    }

    // Confirm high-cost actions
    if (feature.vqtCost > 10) {
      const response: Message = {
        id: Date.now().toString(),
        role: 'vex',
        content: `${feature.name} costs ${feature.vqtCost} VQT (${feature.nairaEquivalent} Naira). This is a premium feature. Would you like to proceed?`,
        timestamp: new Date().toISOString(),
        actions: [
          { label: `Yes, run for ${feature.vqtCost} VQT`, action: () => runFeature(feature, userInput) },
          { label: 'Cancel', action: () => {} },
        ]
      };
      setMessages(prev => [...prev, response]);
      return;
    }

    runFeature(feature, userInput);
  };

  const runFeature = async (feature: { id: string; name: string; description: string; vqtCost: number; nairaEquivalent: number; category: string }, userInput?: string) => {
    const success = spendTokens(feature.vqtCost, feature.id, `VEX executed ${feature.name}`);
    
    if (success) {
      const processingMsg: Message = {
        id: Date.now().toString(),
        role: 'vex',
        content: `Running ${feature.name} with AI analysis... (-${feature.vqtCost} VQT)`,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, processingMsg]);

      // Process with AI
      const { result, source } = await processAIFeature(feature.id, userInput);
      setAiSource(source);

      const resultMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'vex',
        content: formatAIResult(feature.name, result, source),
        timestamp: new Date().toISOString(),
        aiSource: source,
        actions: [
          { label: `View in ${feature.category}`, action: () => navigate(`/${feature.category}`) },
          { label: 'Run another', action: () => setInput('') },
        ]
      };
      setMessages(prev => [...prev, resultMsg]);
    } else {
      toast.error('Failed to execute feature');
    }
  };

  const formatAIResult = (featureName: string, result: any, source: string): string => {
    const sourceBadge = source === 'groq' ? '🚀' : source === 'browser' ? '⚡' : '💻';
    
    if (result?.viralProbability !== undefined) {
      return `${sourceBadge} **${featureName} Results:**\n\n🎯 Viral Probability: **${result.viralProbability}%**\n📊 Prediction: ${result.prediction.toUpperCase()}\n\n**Key Factors:**\n• Hook Strength: ${Math.round(result.factors?.hookStrength * 100)}%\n• Emotional Score: ${Math.round(result.factors?.emotionalScore * 100)}%\n• Engagement Elements: ${Math.round(result.factors?.engagementScore * 100)}%\n\n**Recommendations:**\n${result.recommendations?.map((r: string) => `• ${r}`).join('\n') || '• Content looks good!'}\n\n_Estimated reach: ${result.estimatedReach?.toLocaleString() || 'N/A'} views_`;
    }

    if (result?.botProbability !== undefined || result?.[0]?.botProbability !== undefined) {
      const bots = Array.isArray(result) ? result.filter((r: any) => r.isBot) : [];
      return `${sourceBadge} **${featureName} Results:**\n\n🤖 Bots Detected: **${bots.length}**\n\n${bots.slice(0, 3).map((b: any) => `• @${b.username} (${Math.round(b.botProbability * 100)}% confidence) - ${b.flags?.join(', ')}`).join('\n') || 'No suspicious accounts detected!'}\n\n_Using behavioral pattern analysis_`;
    }

    if (result?.hashtags) {
      return `${sourceBadge} **${featureName} Results:**\n\n🏷️ Recommended Hashtags:\n${result.hashtags.map((h: string) => `#${h}`).join(' ')}\n\n_Relevance score: ${Math.round(result.relevance * 100)}%_`;
    }

    if (result?.matches) {
      return `${sourceBadge} **${featureName} Results:**\n\n💼 Top Matches:\n${result.matches.slice(0, 3).map((m: any) => `• **${m.name}** - ${m.matchScore}% match (₦${m.estimatedDeal?.toLocaleString()})`).join('\n')}\n\n_Estimated monthly value: ₦${result.estimatedMonthlyValue?.toLocaleString() || 'N/A'}_`;
    }

    if (result?.optimizations) {
      return `${sourceBadge} **${featureName} Results:**\n\n✅ Optimizations:\n${result.optimizations.map((o: string) => `• ${o}`).join('\n') || 'No optimizations needed!'}\n\n${result.issues?.length ? `⚠️ Issues:\n${result.issues.map((i: string) => `• ${i}`).join('\n')}` : ''}\n\n_Estimated engagement: ${result.estimatedEngagement}%_`;
    }

    if (result?.sentiment) {
      return `${sourceBadge} **${featureName} Results:**\n\n📊 Overall: **${result[0]?.sentiment?.toUpperCase() || 'NEUTRAL'}**\n_Score: ${result[0]?.score?.toFixed(2) || 0}_`;
    }

    if (result?.response) {
      return `${sourceBadge} ${result.response}`;
    }

    return `${sourceBadge} **${featureName} completed!** Results processed using ${source === 'groq' ? 'Groq AI' : source === 'browser' ? 'browser-based AI' : 'local WebLLM'}.`;
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);

    const featureId = parseCommand(input);
    
    if (featureId) {
      await executeFeature(featureId, input);
    } else {
      // General AI chat
      const { result, source } = await processAIFeature('chat', input);
      setAiSource(source);
      
      const response: Message = {
        id: Date.now().toString(),
        role: 'vex',
        content: result?.response || "I can help with viral strategies, hashtag optimization, engagement tips, bot detection, sponsor matching, and content optimization. What would you like to explore?",
        timestamp: new Date().toISOString(),
        aiSource: source,
        actions: [
          { label: 'Check bots', action: () => executeFeature('f1') },
          { label: 'Viral check', action: () => executeFeature('f21') },
          { label: 'Channel health', action: () => executeFeature('f98') },
        ]
      };
      setMessages(prev => [...prev, response]);
    }
    
    setIsProcessing(false);
  };

  // ============================================================
  // Complete SpeechRecognition Implementation
  // ============================================================
  const createRecognition = (): SpeechRecognition | null => {
    const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) return null;

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = true;          // Listen across multiple utterances
    recognition.interimResults = true;     // Show real-time transcription
    recognition.lang = 'en-US';            // Explicit English language
    recognition.maxAlternatives = 1;

    let silenceTimer: ReturnType<typeof setTimeout> | null = null;
    let fullTranscript = '';

    recognition.onstart = () => {
      setIsListening(true);
      setVoiceError(null);
      setInterimTranscript('');
      setFinalTranscript('');
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      fullTranscript = '';

      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          fullTranscript += result[0].transcript + ' ';
        } else {
          interim += result[0].transcript;
        }
      }

      setInterimTranscript(interim);
      setFinalTranscript(fullTranscript.trim());

      // Reset silence timer on each result
      if (silenceTimer) clearTimeout(silenceTimer);
      silenceTimer = setTimeout(() => {
        // Auto-send after 1.5s of silence
        if (fullTranscript.trim()) {
          setInput(fullTranscript.trim());
          recognition.stop();
        }
      }, 1500);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setIsListening(false);
      let errorMsg = 'Voice recognition failed';

      switch (event.error) {
        case 'not-allowed':
          errorMsg = 'Microphone permission denied. Please allow microphone access in your browser settings.';
          break;
        case 'network':
          errorMsg = 'Network error during voice recognition. Please check your connection.';
          break;
        case 'no-speech':
          errorMsg = 'No speech detected. Please try again.';
          break;
        case 'audio-capture':
          errorMsg = 'No microphone found. Please connect a microphone.';
          break;
        case 'aborted':
          // User-initiated stop, no error needed
          return;
        default:
          errorMsg = `Voice recognition error: ${event.error}`;
      }
      setVoiceError(errorMsg);
      toast.error(errorMsg);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (silenceTimer) clearTimeout(silenceTimer);

      // Auto-send if we have a transcript and user stopped speaking
      if (fullTranscript.trim()) {
        const transcript = fullTranscript.trim();
        setInput(transcript);

        // Auto-send after a brief pause
        autoSendTimerRef.current = setTimeout(() => {
          if (transcript.trim()) {
            // Trigger send with the voice transcript
            setMessages(prev => [...prev, {
              id: Date.now().toString(),
              role: 'user',
              content: transcript,
              timestamp: new Date().toISOString(),
            }]);
            setInput('');
            setIsProcessing(true);

            const featureId = parseCommand(transcript);
            if (featureId) {
              executeFeature(featureId, transcript).finally(() => setIsProcessing(false));
            } else {
              processAIFeature('chat', transcript)
                .then(({ result, source }) => {
                  setAiSource(source);
                  setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: 'vex',
                    content: result?.response || "I can help with viral strategies, hashtag optimization, engagement tips, bot detection, sponsor matching, and content optimization.",
                    timestamp: new Date().toISOString(),
                    aiSource: source,
                    actions: [
                      { label: 'Check bots', action: () => executeFeature('f1') },
                      { label: 'Viral check', action: () => executeFeature('f21') },
                      { label: 'Channel health', action: () => executeFeature('f98') },
                    ]
                  }]);
                })
                .catch(() => {
                  setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: 'vex',
                    content: 'Sorry, I encountered an error processing your voice command. Please try again.',
                    timestamp: new Date().toISOString(),
                  }]);
                })
                .finally(() => setIsProcessing(false));
            }
          }
        }, 300);
      }
    };

    // Store ref for cleanup
    recognitionRef.current = recognition;
    return recognition;
  };

  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Voice input not supported in your browser. Please use Chrome or Edge.');
      setVoiceError('Voice input not supported in your browser. Please use Chrome or Edge.');
      return;
    }

    // Stop existing recognition if running
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }

    const recognition = createRecognition();
    if (recognition) {
      try {
        recognition.start();
      } catch (e) {
        // Already started, restart
        recognition.abort();
        setTimeout(() => recognition.start(), 100);
      }
    }
  };

  const stopVoiceInput = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
        recognitionRef.current = null;
      }
      if (autoSendTimerRef.current) {
        clearTimeout(autoSendTimerRef.current);
      }
    };
  }, []);

  // Proactive intelligence - check for alerts
  useEffect(() => {
    const checkAlerts = () => {
      if (Math.random() > 0.95) {
        const alert: Message = {
          id: Date.now().toString(),
          role: 'vex',
          content: '⚠️ Alert: I detected potential shadow ban risk on your Instagram account. Would you like me to run a full diagnostic?',
          timestamp: new Date().toISOString(),
          actions: [
            { label: 'Run diagnostic', action: () => executeFeature('f4') },
            { label: 'Dismiss', action: () => {} },
          ]
        };
        setMessages(prev => [...prev, alert]);
      }
    };

    const interval = setInterval(checkAlerts, 60000);
    return () => clearInterval(interval);
  }, []);

  if (!isVisible && !autoExpand) return null;

  // Orb Mode (Minimized) — skip when used as a page component
  if (!isExpanded && !autoExpand) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div 
          className="relative group cursor-pointer"
          onClick={() => setIsExpanded(true)}
        >
          {/* Pulse animation for new alerts */}
          {notifications.some(n => !n.isRead) && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping" />
          )}
          
          {/* Main orb */}
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#F97316] to-[#F59E0B] shadow-lg flex items-center justify-center transition-transform group-hover:scale-110">
            <Bot className="w-7 h-7 text-white" />
          </div>
          
          {/* Token balance badge */}
          <div className="absolute -bottom-1 -left-1 px-2 py-0.5 bg-[#0B0F19] rounded-full text-xs text-white font-medium">
            {balance}
          </div>
          
          {/* Alert count */}
          {notifications.filter(n => !n.isRead).length > 0 && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
              {notifications.filter(n => !n.isRead).length}
            </div>
          )}
          
          {/* AI Source indicator */}
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#00D4AA] rounded-full flex items-center justify-center" title={`AI: ${aiSource}`}>
            {aiSource === 'groq' ? <Wifi className="w-3 h-3 text-white" /> : 
             aiSource === 'browser' ? <Cpu className="w-3 h-3 text-white" /> : 
             <WifiOff className="w-3 h-3 text-white" />}
          </div>
        </div>
      </div>
    );
  }

  // Full Page Mode (Expanded)
  if (isVoiceMode) {
    return (
      <>
        {/* Floating orb MUST remain visible in voice mode */}
        <div className="fixed bottom-4 right-4 z-[60]">
          <div
            className="relative group cursor-pointer"
            onClick={() => {
              setIsVoiceMode(false);
              stopVoiceInput();
            }}
          >
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#F97316] to-[#F59E0B] shadow-lg flex items-center justify-center transition-transform group-hover:scale-110">
              <MessageSquare className="w-7 h-7 text-white" />
            </div>
            <div className="absolute -bottom-1 -left-1 px-2 py-0.5 bg-[#0B0F19] rounded-full text-xs text-white font-medium">
              {balance}
            </div>
          </div>
        </div>

        {/* Full-Page Voice Mode Overlay */}
        <div className="fixed inset-0 z-50 bg-[#0B0F19] flex flex-col items-center justify-center p-4">
          {/* Close / Switch to text button */}
          <button
            onClick={() => {
              setIsVoiceMode(false);
              stopVoiceInput();
            }}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 text-[#6B7280] hover:text-white transition-colors flex items-center gap-2 text-sm"
          >
            <Minimize2 className="w-4 h-4" />
            Switch to text mode
          </button>

          {/* VEX branding */}
          <div className="flex items-center gap-3 mb-8 sm:mb-12">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F97316] to-[#F59E0B] flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-semibold text-lg">VEX Voice Mode</span>
          </div>

          {/* Large pulsing mic button */}
          <div className="relative mb-8 sm:mb-12">
            {/* Animated rings */}
            {isListening && (
              <>
                <div className="absolute inset-0 -m-8 rounded-full border-2 border-[#F97316]/30 animate-ping" />
                <div className="absolute inset-0 -m-6 rounded-full border-2 border-[#F97316]/20 animate-ping" style={{ animationDelay: '0.3s' }} />
                <div className="absolute inset-0 -m-4 rounded-full border-2 border-[#F97316]/10 animate-ping" style={{ animationDelay: '0.6s' }} />
              </>
            )}
            <button
              onClick={isListening ? stopVoiceInput : startVoiceInput}
              className={cn(
                'relative w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center transition-all duration-300',
                isListening
                  ? 'bg-[#EF4444] hover:bg-[#EF4444]/90 shadow-[0_0_60px_rgba(239,68,68,0.4)]'
                  : 'bg-gradient-to-br from-[#F97316] to-[#F59E0B] hover:shadow-[0_0_40px_rgba(249,115,22,0.4)] shadow-lg'
              )}
            >
              {isListening ? (
                <MicOff className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              ) : (
                <Mic className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              )}
            </button>
          </div>

          {/* Status */}
          <p className="text-sm text-[#6B7280] mb-6">
            {isListening ? 'Listening... Speak now' : 'Tap the microphone to start'}
          </p>

          {/* Live transcription panel */}
          <div className="w-full max-w-xl bg-[#1A1A2E] rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 min-h-[100px] sm:min-h-[120px]">
            <div className="flex items-center gap-2 mb-4">
              <div className={cn('w-2 h-2 rounded-full', isListening ? 'bg-[#F97316] animate-pulse' : 'bg-[#6B7280]')} />
              <span className="text-xs text-[#6B7280] uppercase tracking-wider">Live Transcription</span>
            </div>
            <div className="space-y-2">
              {finalTranscript && (
                <p className="text-white text-lg">{finalTranscript}</p>
              )}
              {interimTranscript && (
                <p className="text-[#F97316] text-lg italic">{interimTranscript}</p>
              )}
              {!finalTranscript && !interimTranscript && !voiceError && (
                <p className="text-[#6B7280] text-sm">Your speech will appear here in real-time...</p>
              )}
              {voiceError && (
                <div className="flex items-center gap-2">
                  <span className="text-[#EF4444] text-sm">{voiceError}</span>
                  <button onClick={() => setVoiceError(null)} className="text-[#6B7280] text-xs underline">Dismiss</button>
                </div>
              )}
            </div>
          </div>

          {/* Voice commands reference */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {['check bots', 'viral check', 'find sponsors', 'channel health', 'hashtag strategy', 'optimize content'].map((cmd) => (
              <div
                key={cmd}
                className="px-3 py-1.5 bg-[#1A1A2E] rounded-full text-xs text-[#6B7280] border border-[#2A2A4E]"
              >
                &quot;{cmd}&quot;
              </div>
            ))}
          </div>

          {/* Recent conversation preview */}
          {messages.length > 1 && (
            <div className="w-full max-w-xl">
              <p className="text-xs text-[#6B7280] mb-3 text-center">Recent conversation</p>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {messages.slice(-4).map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      'px-3 py-2 rounded-lg text-sm',
                      msg.role === 'user' ? 'bg-[#1A1A2E] text-white ml-8' : 'bg-[#2A2A4E] text-[#E5E7EB] mr-8'
                    )}
                  >
                    {msg.content.length > 80 ? msg.content.slice(0, 80) + '...' : msg.content}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </>
    );
  }

  return (
    <div className={autoExpand ? "h-full" : "fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"}>
      <Card className={autoExpand ? "w-full h-full flex flex-col border-[#E5E7EB] shadow-2xl" : "w-full max-w-2xl h-[80vh] flex flex-col border-[#E5E7EB] shadow-2xl"}>
        {/* Header */}
        <CardHeader className="flex flex-row items-center justify-between py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F97316] to-[#F59E0B] flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-[#0B0F19]">VEX AI Assistant</h3>
              <p className="text-xs text-[#6B7280]">Powered by {aiSource === 'groq' ? 'Groq AI' : aiSource === 'browser' ? 'Browser AI' : 'WebLLM'}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <Badge variant="secondary" className="gap-1 hidden sm:flex">
              <Coins className="w-3 h-3" />
              {formatVQT(balance)}
            </Badge>
            <div className="hidden sm:flex items-center gap-1 px-2 py-1 bg-[#F6F7F9] rounded-lg" title={isOnline ? 'Online' : 'Offline'}>
              {isOnline ? <Wifi className="w-3 h-3 text-[#00D4AA]" /> : <WifiOff className="w-3 h-3 text-[#EF4444]" />}
              <span className="text-xs text-[#6B7280]">{isOnline ? 'Online' : 'Offline'}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsVoiceMode(true)} title="Full-page voice mode">
              <Maximize2 className="w-4 h-4" />
            </Button>
            {!autoExpand && (
              <Button variant="ghost" size="icon" onClick={() => setIsExpanded(false)}>
                <Minimize2 className="w-4 h-4" />
              </Button>
            )}
            {!autoExpand && (
              <Button variant="ghost" size="icon" onClick={() => setIsVisible(false)}>
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardHeader>

        {/* Messages */}
        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-full p-4">
            <div className="space-y-4">
              {/* Today's Intelligence Summary */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-[#F97316]/10 to-[#F59E0B]/10 border border-[#F97316]/20">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-[#F97316]" />
                  <span className="font-medium text-[#0B0F19]">Today&apos;s Intelligence</span>
                </div>
                <ul className="space-y-1 text-sm text-[#6B7280]">
                  <li>• {getFreeAnalysesRemaining()} free analyses remaining today</li>
                  <li>• Channel health: Good (78/100)</li>
                  <li>• Next optimal post time: 6:00 PM</li>
                  <li>• AI Mode: {aiSource === 'groq' ? '🚀 Groq (Fast)' : aiSource === 'browser' ? '⚡ Browser (Local)' : '💻 WebLLM (Offline)'}</li>
                  {user?.isLiminalOptIn && (
                    <li>• Burnout risk: Low</li>
                  )}
                </ul>
              </div>

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex gap-3',
                    message.role === 'user' ? 'flex-row-reverse' : ''
                  )}
                >
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                    message.role === 'user' ? 'bg-[#00D4AA]' : 'bg-gradient-to-br from-[#F97316] to-[#F59E0B]'
                  )}>
                    {message.role === 'user' ? (
                      <span className="text-white text-xs font-medium">You</span>
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className={cn(
                    'max-w-[80%]',
                    message.role === 'user' ? 'text-right' : ''
                  )}>
                    <div className={cn(
                      'inline-block px-4 py-2 rounded-2xl text-sm whitespace-pre-line',
                      message.role === 'user' 
                        ? 'bg-[#00D4AA] text-white rounded-br-none' 
                        : 'bg-[#F6F7F9] text-[#0B0F19] rounded-bl-none'
                    )}>
                      {message.content}
                    </div>
                    {message.aiSource && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-[#6B7280]">
                        {message.aiSource === 'groq' && <Wifi className="w-3 h-3" />}
                        {message.aiSource === 'browser' && <Cpu className="w-3 h-3" />}
                        {message.aiSource === 'webllm' && <WifiOff className="w-3 h-3" />}
                        <span>via {message.aiSource}</span>
                      </div>
                    )}
                    {message.actions && message.actions.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {message.actions.map((action, i) => (
                          <Button
                            key={i}
                            size="sm"
                            variant="outline"
                            className="text-xs"
                            onClick={action.action}
                          >
                            {action.label}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isProcessing && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#F97316] to-[#F59E0B] flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-[#F6F7F9] px-4 py-2 rounded-2xl rounded-bl-none">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-[#6B7280] rounded-full animate-bounce" />
                        <span className="w-2 h-2 bg-[#6B7280] rounded-full animate-bounce delay-100" />
                        <span className="w-2 h-2 bg-[#6B7280] rounded-full animate-bounce delay-200" />
                      </div>
                      <span className="text-xs text-[#6B7280]">Processing with {aiSource}...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </CardContent>

        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              className={cn(
                'flex-shrink-0',
                isListening && 'bg-red-100 text-red-500 animate-pulse'
              )}
              onClick={startVoiceInput}
            >
              <Mic className="w-4 h-4" />
            </Button>
            <Input
              placeholder="Ask VEX anything... (e.g., 'check bots', 'viral check')"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1"
            />
            <Button 
              className="bg-[#F97316] hover:bg-[#F97316]/90"
              onClick={handleSend}
              disabled={!input.trim() || isProcessing}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-[#6B7280] mt-2 text-center">
            Try: &quot;check bots&quot;, &quot;viral check&quot;, &quot;find sponsors&quot;, &quot;channel health&quot; • Voice commands: +1 VQT
          </p>
        </div>
      </Card>
    </div>
  );
}
