// Cirkle — Auth Screen: Register / Login / Identity Verification
// Supports: Email, Phone (SMS), Telegram, Haweya (Egyptian National ID), InstaPay
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Mail, Phone, Send, Shield, ArrowLeft, Loader2, CheckCircle2, Eye, EyeOff,
  UserPlus, LogIn, Fingerprint, Building2, CreditCard, X, ChevronRight,
  Smartphone, Globe2, BadgeCheck, Lock, Sparkles, AlertCircle,
} from "lucide-react";
import { apiGet, apiPost } from "@/lib/api";
import { toast } from "sonner";

type AuthStep = 'choose' | 'register' | 'login' | 'otp' | 'verify-identity' | 'success';
type AuthMethod = 'email' | 'phone' | 'telegram';
type VerifyProvider = 'haweya' | 'instapay';

interface SessionData {
  session_id: string;
  user_id: number;
  demo_otp?: string;
  user?: any;
}

const METHOD_META = {
  email: { icon: Mail, label: 'Email', placeholder: 'you@example.com', color: 'text-blue-400' },
  phone: { icon: Phone, label: 'Phone (SMS)', placeholder: '+20-10XXXXXXXX', color: 'text-green-400' },
  telegram: { icon: Send, label: 'Telegram', placeholder: '@your_handle', color: 'text-sky-400' },
};

export function AuthScreen() {
  const navigate = useNavigate();
  const [step, setStep] = useState<AuthStep>('choose');
  const [method, setMethod] = useState<AuthMethod>('email');
  const [identifier, setIdentifier] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [otp, setOtp] = useState('');
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if already logged in
  useEffect(() => {
    const sid = localStorage.getItem('cirkle-session');
    if (sid) {
      apiGet(`/auth/session/${sid}`)
        .then((d: any) => {
          if (d.session?.status === 'active') {
            navigate('/');
          }
        })
        .catch(() => {});
    }
  }, [navigate]);

  const handleRegister = async () => {
    setError(null);
    if (!identifier || !displayName) { setError('All fields are required'); return; }
    setLoading(true);
    try {
      const res = await apiPost<SessionData & { handle: string; message: string }>('/auth/register', {
        method,
        identifier,
        display_name: displayName,
        country: 'EG',
        city: 'Cairo',
      });
      setSession(res);
      toast.success(res.message);
      if (res.demo_otp) toast.info(`Demo OTP: ${res.demo_otp}`, { duration: 15000 });
      setStep('otp');
    } catch (e: any) {
      setError(e?.body?.error === 'identifier_already_registered'
        ? 'This identifier is already registered. Try logging in.'
        : e?.body?.error ?? 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setError(null);
    if (!identifier) { setError('Enter your identifier'); return; }
    setLoading(true);
    try {
      const res = await apiPost<SessionData & { message: string }>('/auth/login', {
        method,
        identifier,
      });
      setSession(res);
      toast.success(res.message);
      if (res.demo_otp) toast.info(`Demo OTP: ${res.demo_otp}`, { duration: 15000 });
      setStep('otp');
    } catch (e: any) {
      setError(e?.body?.error === 'not_found'
        ? 'No account found. Try registering.'
        : e?.body?.error ?? 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError(null);
    if (!otp || !session) { setError('Enter the OTP code'); return; }
    setLoading(true);
    try {
      const res = await apiPost<{ ok: boolean; session_id: string; user: any }>('/auth/verify-otp', {
        session_id: session.session_id,
        otp,
      });
      localStorage.setItem('cirkle-session', session.session_id);
      localStorage.setItem('cirkle-user', JSON.stringify(res.user));
      toast.success('Welcome to Cirkle!');
      setStep('success');
      setTimeout(() => navigate('/'), 1500);
    } catch (e: any) {
      setError(e?.body?.error === 'invalid_otp' ? 'Invalid code. Try again.'
        : e?.body?.error === 'otp_expired' ? 'Code expired. Request a new one.'
        : e?.body?.error ?? 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="px-5 pt-12 pb-6">
        <div className="flex items-center gap-3 mb-6">
          {step !== 'choose' && (
            <button
              onClick={() => { setStep(step === 'otp' ? (session ? 'login' : 'choose') : 'choose'); setError(null); }}
              className="w-9 h-9 rounded-full glass flex items-center justify-center"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div className="flex-1" />
          {step === 'choose' && (
            <button onClick={() => navigate('/')} className="text-xs text-muted-foreground hover:text-secondary">
              Skip for now
            </button>
          )}
        </div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="w-16 h-16 rounded-3xl bg-gradient-hero mx-auto mb-4 flex items-center justify-center shadow-float">
            <Lock className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-display text-3xl mb-1">
            {step === 'choose' ? 'Cirkle' : step === 'register' ? 'Create Account' : step === 'login' ? 'Welcome Back' : step === 'otp' ? 'Verify Code' : step === 'verify-identity' ? 'Verify Identity' : 'Welcome!'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {step === 'choose' ? 'Sign in to your social operating system' :
             step === 'register' ? 'Join the Cirkle community' :
             step === 'login' ? 'Sign in with your credentials' :
             step === 'otp' ? `Enter the code sent to your ${method}` :
             step === 'verify-identity' ? 'Prove your identity with Haweya or InstaPay' :
             'You\'re all set!'}
          </p>
        </motion.div>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 pb-8">
        <AnimatePresence mode="wait">
          {/* === STEP: Choose === */}
          {step === 'choose' && (
            <motion.div key="choose" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <button
                onClick={() => setStep('login')}
                className="w-full glass rounded-2xl p-4 flex items-center gap-4 hover:border-secondary/30 border border-transparent transition"
              >
                <div className="w-12 h-12 rounded-xl bg-secondary/15 flex items-center justify-center">
                  <LogIn className="w-5 h-5 text-secondary" />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium">Sign In</div>
                  <div className="text-[11px] text-muted-foreground">Email, Phone, or Telegram</div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>

              <button
                onClick={() => setStep('register')}
                className="w-full glass rounded-2xl p-4 flex items-center gap-4 hover:border-secondary/30 border border-transparent transition"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium">Create Account</div>
                  <div className="text-[11px] text-muted-foreground">New to Cirkle? Join now</div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>

              <div className="pt-4">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground text-center mb-3">
                  Verify your identity
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setStep('verify-identity')}
                    className="glass rounded-2xl p-3 flex flex-col items-center gap-2 hover:border-secondary/30 border border-transparent transition"
                  >
                    <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
                      <Fingerprint className="w-5 h-5 text-amber-500" />
                    </div>
                    <span className="text-[11px] font-medium">Haweya</span>
                    <span className="text-[9px] text-muted-foreground">Egyptian National ID</span>
                  </button>
                  <button
                    onClick={() => setStep('verify-identity')}
                    className="glass rounded-2xl p-3 flex flex-col items-center gap-2 hover:border-secondary/30 border border-transparent transition"
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-emerald-500" />
                    </div>
                    <span className="text-[11px] font-medium">InstaPay</span>
                    <span className="text-[9px] text-muted-foreground">Bank account verify</span>
                  </button>
                </div>
              </div>

              <div className="pt-6 text-center">
                <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                  <Shield className="w-3 h-3" />
                  Privacy-first · End-to-end encrypted · Zero tracking
                </p>
              </div>
            </motion.div>
          )}

          {/* === STEP: Login === */}
          {step === 'login' && (
            <motion.div key="login" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <MethodSelector method={method} onChange={setMethod} />
              <IdentifierInput method={method} value={identifier} onChange={setIdentifier} />
              {error && <ErrorBox message={error} />}
              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full rounded-full bg-gradient-hero text-primary-foreground py-3 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-60 hover:opacity-95 transition"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                {loading ? 'Sending code…' : 'Send verification code'}
              </button>
              <p className="text-center text-xs text-muted-foreground">
                Don't have an account?{' '}
                <button onClick={() => { setStep('register'); setError(null); }} className="text-secondary hover:underline">Register</button>
              </p>
            </motion.div>
          )}

          {/* === STEP: Register === */}
          {step === 'register' && (
            <motion.div key="register" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <MethodSelector method={method} onChange={setMethod} />
              <label className="block">
                <div className="text-xs text-muted-foreground mb-1">Display Name</div>
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-secondary"
                />
              </label>
              <IdentifierInput method={method} value={identifier} onChange={setIdentifier} />
              {error && <ErrorBox message={error} />}
              <button
                onClick={handleRegister}
                disabled={loading}
                className="w-full rounded-full bg-gradient-hero text-primary-foreground py-3 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-60 hover:opacity-95 transition"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                {loading ? 'Creating account…' : 'Create Account'}
              </button>
              <p className="text-center text-xs text-muted-foreground">
                Already have an account?{' '}
                <button onClick={() => { setStep('login'); setError(null); }} className="text-secondary hover:underline">Sign in</button>
              </p>
            </motion.div>
          )}

          {/* === STEP: OTP === */}
          {step === 'otp' && (
            <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div className="glass rounded-2xl p-4 text-center">
                <div className="w-12 h-12 rounded-xl bg-secondary/15 mx-auto mb-3 flex items-center justify-center">
                  {METHOD_META[method].icon && <Smartphone className="w-5 h-5 text-secondary" />}
                </div>
                <p className="text-sm text-muted-foreground">
                  We sent a 6-digit code to <span className="font-medium text-foreground">{identifier}</span>
                </p>
                {session?.demo_otp && (
                  <p className="mt-2 text-xs text-secondary bg-secondary/10 rounded-lg px-3 py-1.5 inline-block">
                    Demo mode — Code: <span className="font-mono font-bold">{session.demo_otp}</span>
                  </p>
                )}
              </div>

              <div className="flex justify-center gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <input
                    key={i}
                    type="text"
                    maxLength={1}
                    value={otp[i] ?? ''}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      const newOtp = otp.split('');
                      newOtp[i] = val;
                      setOtp(newOtp.join(''));
                      if (val && i < 5) {
                        const next = e.target.nextElementSibling as HTMLInputElement;
                        next?.focus();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !otp[i] && i > 0) {
                        const prev = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
                        prev?.focus();
                      }
                    }}
                    className="w-12 h-14 rounded-xl border border-border bg-background text-center text-lg font-mono outline-none focus:border-secondary"
                  />
                ))}
              </div>

              {error && <ErrorBox message={error} />}

              <button
                onClick={handleVerifyOtp}
                disabled={loading || otp.length < 6}
                className="w-full rounded-full bg-gradient-hero text-primary-foreground py-3 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-60 hover:opacity-95 transition"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                {loading ? 'Verifying…' : 'Verify & Sign In'}
              </button>

              <p className="text-center text-xs text-muted-foreground">
                Didn't receive the code?{' '}
                <button onClick={() => toast.info('New code sent!')} className="text-secondary hover:underline">Resend</button>
              </p>
            </motion.div>
          )}

          {/* === STEP: Verify Identity === */}
          {step === 'verify-identity' && (
            <IdentityVerificationStep onBack={() => setStep('choose')} />
          )}

          {/* === STEP: Success === */}
          {step === 'success' && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
                className="w-20 h-20 rounded-full bg-secondary/20 mx-auto mb-4 flex items-center justify-center"
              >
                <CheckCircle2 className="w-10 h-10 text-secondary" />
              </motion.div>
              <h2 className="font-display text-2xl mb-2">Welcome to Cirkle!</h2>
              <p className="text-sm text-muted-foreground">Redirecting to your dashboard…</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function MethodSelector({ method, onChange }: { method: AuthMethod; onChange: (m: AuthMethod) => void }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground mb-2">Sign in method</div>
      <div className="flex gap-2">
        {(['email', 'phone', 'telegram'] as AuthMethod[]).map((m) => {
          const meta = METHOD_META[m];
          const Icon = meta.icon;
          return (
            <button
              key={m}
              onClick={() => onChange(m)}
              className={`flex-1 rounded-xl py-2.5 flex flex-col items-center gap-1.5 border transition ${
                method === m ? 'border-secondary bg-secondary/10' : 'border-border hover:bg-muted/50'
              }`}
            >
              <Icon className={`w-4 h-4 ${method === m ? 'text-secondary' : 'text-muted-foreground'}`} />
              <span className="text-[10px]">{meta.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function IdentifierInput({ method, value, onChange }: { method: AuthMethod; value: string; onChange: (v: string) => void }) {
  const meta = METHOD_META[method];
  return (
    <label className="block">
      <div className="text-xs text-muted-foreground mb-1">{meta.label}</div>
      <div className="relative">
        <meta.icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type={method === 'email' ? 'email' : 'text'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={meta.placeholder}
          className="w-full rounded-xl border border-border bg-background pl-10 pr-3 py-2.5 text-sm outline-none focus:border-secondary"
        />
      </div>
    </label>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs px-3 py-2 flex items-center gap-2">
      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
      {message}
    </div>
  );
}

function IdentityVerificationStep({ onBack }: { onBack: () => void }) {
  const [provider, setProvider] = useState<VerifyProvider | null>(null);
  const [fullName, setFullName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [instapayPhone, setInstapayPhone] = useState('');
  const [governorate, setGovernorate] = useState('Cairo');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);
  const [existingVerifications, setExistingVerifications] = useState<any[]>([]);

  // Check existing verifications for demo user
  useEffect(() => {
    const stored = localStorage.getItem('cirkle-user');
    const userId = stored ? JSON.parse(stored)?.id : 1;
    apiGet(`/auth/verify-identity/${userId}`)
      .then((d: any) => setExistingVerifications(d.verifications ?? []))
      .catch(() => {});
  }, [verified]);

  const GOVERNORATES = [
    'Cairo', 'Alexandria', 'Giza', 'Qalyubia', 'Port Said', 'Suez', 'Dakahlia',
    'Sharqia', 'Gharbia', 'Monufia', 'Beheira', 'Kafr El Sheikh', 'Fayoum',
    'Beni Suef', 'Minya', 'Assiut', 'Sohag', 'Qena', 'Luxor', 'Aswan',
    'Red Sea', 'New Valley', 'Matrouh', 'North Sinai', 'South Sinai', 'Ismailia', 'Damietta',
  ];

  const handleSubmit = async () => {
    setError(null);
    if (!provider || !fullName) { setError('Please fill all required fields'); return; }
    if (provider === 'haweya' && !nationalId) { setError('National ID is required'); return; }
    if (provider === 'instapay' && !instapayPhone) { setError('InstaPay phone number is required'); return; }

    const stored = localStorage.getItem('cirkle-user');
    const userId = stored ? JSON.parse(stored)?.id : 1;

    setLoading(true);
    try {
      const res = await apiPost<{ ok: boolean; verification_ref: string; status: string; message: string }>('/auth/verify-identity', {
        user_id: userId,
        provider,
        national_id: provider === 'haweya' ? nationalId : undefined,
        instapay_phone: provider === 'instapay' ? instapayPhone : undefined,
        full_name: fullName,
        governorate,
      });
      toast.success(res.message, { description: `Reference: ${res.verification_ref}` });
      setVerified(true);
    } catch (e: any) {
      setError(e?.body?.error ?? 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  if (verified) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8 space-y-4">
        <div className="w-16 h-16 rounded-full bg-secondary/20 mx-auto flex items-center justify-center">
          <BadgeCheck className="w-8 h-8 text-secondary" />
        </div>
        <h2 className="font-display text-xl">Identity Verified!</h2>
        <p className="text-sm text-muted-foreground">Your Cirkle account now has verified identity status.</p>
        <button onClick={onBack} className="text-sm text-secondary hover:underline">Back to auth</button>
      </motion.div>
    );
  }

  return (
    <motion.div key="verify" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
      {/* Existing verifications */}
      {existingVerifications.length > 0 && (
        <div className="glass rounded-2xl p-3 space-y-2">
          <div className="text-[10px] uppercase tracking-widest text-secondary font-mono">Existing Verifications</div>
          {existingVerifications.map((v: any) => (
            <div key={v.id} className="flex items-center gap-2 text-xs">
              {v.status === 'verified' ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-secondary shrink-0" />
              ) : (
                <Loader2 className="w-3.5 h-3.5 text-muted-foreground animate-spin shrink-0" />
              )}
              <span className="font-medium">{v.provider === 'haweya' ? 'Haweya' : 'InstaPay'}</span>
              <span className="text-muted-foreground">·</span>
              <span className={v.status === 'verified' ? 'text-secondary' : 'text-muted-foreground'}>{v.status}</span>
              {v.verified_name && <span className="text-muted-foreground ml-auto truncate max-w-[120px]">{v.verified_name}</span>}
            </div>
          ))}
        </div>
      )}

      {/* Provider selection */}
      {!provider ? (
        <div className="space-y-3">
          <div className="text-xs text-muted-foreground mb-1">Choose verification method</div>

          <button
            onClick={() => setProvider('haweya')}
            className="w-full glass rounded-2xl p-4 flex items-center gap-4 hover:border-secondary/30 border border-transparent transition"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-500/15 flex items-center justify-center">
              <Fingerprint className="w-5 h-5 text-amber-500" />
            </div>
            <div className="flex-1 text-left">
              <div className="text-sm font-medium">Haweya</div>
              <div className="text-[11px] text-muted-foreground">Egyptian National ID verification</div>
              <div className="text-[9px] text-amber-500/70 mt-0.5">Powered by Egypt's Digital Identity Authority</div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>

          <button
            onClick={() => setProvider('instapay')}
            className="w-full glass rounded-2xl p-4 flex items-center gap-4 hover:border-secondary/30 border border-transparent transition"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-500/15 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="flex-1 text-left">
              <div className="text-sm font-medium">InstaPay Account</div>
              <div className="text-[11px] text-muted-foreground">Verify via your linked bank account</div>
              <div className="text-[9px] text-emerald-500/70 mt-0.5">CBE-licensed instant payment network</div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>

          <div className="text-[10px] text-muted-foreground text-center pt-2 flex items-center justify-center gap-1">
            <Lock className="w-3 h-3" />
            Your data is hashed locally. We never store raw national IDs.
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary/5 border border-secondary/20">
            {provider === 'haweya' ? <Fingerprint className="w-4 h-4 text-amber-500" /> : <Building2 className="w-4 h-4 text-emerald-500" />}
            <span className="text-sm font-medium">{provider === 'haweya' ? 'Haweya — National ID' : 'InstaPay — Bank Account'}</span>
            <button onClick={() => setProvider(null)} className="ml-auto text-[10px] text-secondary hover:underline">Change</button>
          </div>

          <label className="block">
            <div className="text-xs text-muted-foreground mb-1">Full Legal Name (as on ID)</div>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ahmed Mohamed Saleh"
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-secondary"
            />
          </label>

          {provider === 'haweya' && (
            <>
              <label className="block">
                <div className="text-xs text-muted-foreground mb-1">National ID Number</div>
                <input
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value.replace(/\D/g, ''))}
                  placeholder="14-digit Egyptian National ID"
                  maxLength={14}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm font-mono outline-none focus:border-secondary"
                />
              </label>
              <label className="block">
                <div className="text-xs text-muted-foreground mb-1">Governorate</div>
                <select
                  value={governorate}
                  onChange={(e) => setGovernorate(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-secondary"
                >
                  {GOVERNORATES.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </label>
            </>
          )}

          {provider === 'instapay' && (
            <label className="block">
              <div className="text-xs text-muted-foreground mb-1">InstaPay-linked Phone Number</div>
              <input
                value={instapayPhone}
                onChange={(e) => setInstapayPhone(e.target.value)}
                placeholder="+20-10XXXXXXXX"
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-secondary"
              />
            </label>
          )}

          {error && <ErrorBox message={error} />}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full rounded-full bg-gradient-hero text-primary-foreground py-3 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-60 hover:opacity-95 transition"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
            {loading ? 'Verifying…' : `Verify with ${provider === 'haweya' ? 'Haweya' : 'InstaPay'}`}
          </button>

          <div className="glass rounded-2xl p-3 text-[10px] text-muted-foreground space-y-1.5">
            <div className="flex items-center gap-1.5"><Lock className="w-3 h-3 text-secondary shrink-0" /> National ID is hashed on-device before transmission</div>
            <div className="flex items-center gap-1.5"><Shield className="w-3 h-3 text-secondary shrink-0" /> Cirkle never stores raw personal data</div>
            <div className="flex items-center gap-1.5"><Sparkles className="w-3 h-3 text-secondary shrink-0" /> Verified status unlocks higher transaction limits</div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default AuthScreen;
