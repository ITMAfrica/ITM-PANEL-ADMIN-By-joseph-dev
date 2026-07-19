'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import { APP_NAME_UPPER } from '@/lib/app-config';
import { Checkbox } from '@/components/ui/checkbox';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeftRight,
  Eye,
  EyeOff,
  HelpCircle,
  Languages,
  Layers,
  LineChart,
  Moon,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';

const GRAIN_BG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDM4e8vFVBj863BaVn8Ma7TcruOjFV4ZkkvXOYhrjGc1HUh6LQoiZ6cUIp6HpLVC4rEBHNum1T0_aVfaIlL0AqBGacbw4I9TiGQBMpXku_9XUCCSFlW1rPgN4sztGfgTSjJZs9kDV97I4-PzZ2Ub7wjH9NT1rJSCVXVpRvXSg-0evzTDdXRXh-uK3T85mM68eeEF6EXWL2C4BIHY8PO68zWp0vhalRCte8vkE3BDkR2DEFFoATHfKCZjZAOBCqqlvt1yRo885v0Cjw';

function LoginShaderCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const syncSize = () => {
      const w = canvas.clientWidth || 640;
      const h = canvas.clientHeight || 720;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    };

    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(syncSize) : null;
    observer?.observe(canvas);
    syncSize();

    const glContext = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!glContext) return;
    const gl = glContext as WebGLRenderingContext;

    const vs = `attribute vec2 a_position;
varying vec2 v_texCoord;
void main() {
  v_texCoord = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;
    const fs = `precision highp float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
varying vec2 v_texCoord;
float noise(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}
float smoothNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = noise(i);
  float b = noise(i + vec2(1.0, 0.0));
  float c = noise(i + vec2(0.0, 1.0));
  float d = noise(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
void main() {
  vec2 uv = v_texCoord;
  vec2 mouse = u_mouse / u_resolution;
  float t = u_time * 0.3;
  vec3 color1 = vec3(0.075, 0.075, 0.075);
  vec3 color2 = vec3(0.83, 1.0, 0.0);
  vec3 color3 = vec3(0.1, 0.05, 0.15);
  float wave = smoothNoise(uv * 3.0 + t + mouse * 0.5);
  wave += 0.5 * smoothNoise(uv * 6.0 - t * 0.8);
  wave += 0.25 * smoothNoise(uv * 12.0 + t * 1.2);
  wave = wave / 1.75;
  vec3 finalColor = mix(color1, color3, wave);
  float glow = pow(wave, 4.0);
  finalColor = mix(finalColor, color2 * 0.3, glow * 0.4);
  float vignette = 1.0 - length(uv - 0.5) * 0.7;
  finalColor *= vignette;
  gl_FragColor = vec4(finalColor, 1.0);
}`;

    const compileShader = (type: number, src: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      return shader;
    };

    const prog = gl.createProgram();
    if (!prog) return;
    const vShader = compileShader(gl.VERTEX_SHADER, vs);
    const fShader = compileShader(gl.FRAGMENT_SHADER, fs);
    if (!vShader || !fShader) return;
    gl.attachShader(prog, vShader);
    gl.attachShader(prog, fShader);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const pos = gl.getAttribLocation(prog, 'a_position');
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uRes = gl.getUniformLocation(prog, 'u_resolution');
    const uMouse = gl.getUniformLocation(prog, 'u_mouse');

    mouseRef.current = { x: canvas.width / 2, y: canvas.height / 2 };

    const onMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const nx = (event.clientX - rect.left) / rect.width;
      const ny = 1.0 - (event.clientY - rect.top) / rect.height;
      mouseRef.current = { x: nx * canvas.width, y: ny * canvas.height };
    };
    window.addEventListener('mousemove', onMouseMove);

    let frameId = 0;
    const render = (t: number) => {
      if (!observer) syncSize();
      gl.viewport(0, 0, canvas.width, canvas.height);
      if (uTime) gl.uniform1f(uTime, t * 0.001);
      if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
      if (uMouse) gl.uniform2f(uMouse, mouseRef.current.x, mouseRef.current.y);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      frameId = requestAnimationFrame(render);
    };
    frameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('mousemove', onMouseMove);
      observer?.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" aria-hidden />;
}

function FeatureCard({ Icon, title, desc }: { Icon: LucideIcon; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-3 backdrop-blur-xl">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-[#2a2a2a]">
        <Icon className="h-5 w-5 text-[#b0d500]" strokeWidth={1.75} />
      </div>
      <div>
        <h3 className="text-base font-normal text-white">{title}</h3>
        <p className="text-sm leading-relaxed text-[#c5c9ac]">{desc}</p>
      </div>
    </div>
  );
}

export function LoginPage() {
  const login = useAppStore((s) => s.login);
  const register = useAppStore((s) => s.register);
  const locale = useAppStore((s) => s.locale);
  const setLocale = useAppStore((s) => s.setLocale);
  const { t } = useTranslation();
  const { setTheme, resolvedTheme } = useTheme();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('josephbasix@gmail.com');
  const [password, setPassword] = useState('123456Test');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const switchToSignup = useCallback(() => {
    setMode('signup');
    setError('');
    setPassword('');
    setConfirmPassword('');
  }, []);

  const switchToLogin = useCallback(() => {
    setMode('login');
    setError('');
    setConfirmPassword('');
    setEmail('josephbasix@gmail.com');
    setPassword('123456Test');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (mode === 'signup') {
      if (!fullName.trim() || !email || !password || !confirmPassword) {
        setError(t.login.fillAllFields);
        setIsLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setError(t.login.passwordMismatch);
        setIsLoading(false);
        return;
      }
      const ok = await register(fullName.trim(), email, password, rememberMe);
      if (ok) {
        toast.success(t.toast.accountCreated);
        useAppStore.getState().setCreateWorkspaceDialogOpen(true);
      } else {
        setError(t.login.enterCredentials);
      }
    } else if (email && password) {
      const ok = await login(email, password, rememberMe);
      if (ok) {
        toast.success(t.toast.welcomeBack);
      } else {
        setError(t.login.enterCredentials);
      }
    } else {
      setError(t.login.enterCredentials);
    }
    setIsLoading(false);
  };

  const features = [
    { Icon: Zap, title: t.login.feature1Title, desc: t.login.feature1Desc },
    { Icon: LineChart, title: t.login.feature2Title, desc: t.login.feature2Desc },
    { Icon: ArrowLeftRight, title: t.login.feature3Title, desc: t.login.feature3Desc },
  ] as const;

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#131313] font-[family-name:var(--font-geist-sans)] text-[#e5e2e1] selection:bg-[#b0d500] selection:text-black">
      <header className="absolute top-0 z-50 flex w-full items-center justify-between px-6 py-4 md:px-12">
        <div className="flex items-center gap-1">
          <Layers className="h-8 w-8 text-[#b0d500]" strokeWidth={2.25} />
          <span className="text-lg font-bold uppercase tracking-tighter text-white">{APP_NAME_UPPER}</span>
        </div>
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => setLocale(locale === 'fr' ? 'en' : 'fr')}
            className="flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.1em] text-white transition-colors hover:text-[#b0d500]"
          >
            <Languages className="h-[18px] w-[18px]" strokeWidth={1.75} />
            {locale.toUpperCase()}
          </button>
          <div className="hidden items-center gap-3 sm:flex">
            <button type="button" className="text-white transition-colors hover:text-[#b0d500]" aria-label="Help">
              <HelpCircle className="h-5 w-5" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              className="text-white transition-colors hover:text-[#b0d500]"
              aria-label="Toggle theme"
            >
              <Moon className="h-5 w-5" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex min-h-screen flex-grow flex-col md:flex-row">
        <section className="relative flex w-full flex-col justify-center overflow-hidden border-white/5 bg-black px-6 py-24 md:w-1/2 md:border-r md:px-12 lg:px-20">
          <LoginShaderCanvas />
          <div
            className="pointer-events-none absolute inset-0 z-10 opacity-10"
            style={{
              backgroundImage: `url(${GRAIN_BG})`,
              filter: 'contrast(150%) brightness(100%)',
            }}
          />

          <div className="relative z-20 max-w-lg">
            <h1 className="mb-6 text-4xl font-extralight leading-tight tracking-[-0.04em] text-white lg:text-5xl">
              {t.login.leftTitle1}
              <br />
              <span className="font-bold text-[#b0d500]">{t.login.leftTitle2}</span>
            </h1>
            <p className="mb-12 text-base leading-relaxed text-[#c8c6c5]">{t.login.leftSubtitle}</p>

            <div className="space-y-3">
              {features.map((feature) => (
                <FeatureCard key={feature.title} Icon={feature.Icon} title={feature.title} desc={feature.desc} />
              ))}
            </div>
          </div>
        </section>

        <section className="relative flex w-full flex-col items-center justify-center overflow-hidden bg-white px-4 py-16 md:w-1/2 md:px-6 md:py-24">
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'radial-gradient(#e5e2e1 0.5px, transparent 0.5px)',
              backgroundSize: '24px 24px',
            }}
          />
          <div className="pointer-events-none absolute bottom-0 right-0 h-1/3 w-full bg-gradient-to-t from-[#b0d500]/5 to-transparent" />

          <div className="relative z-10 w-full max-w-md">
            <div className="rounded-[2rem] border border-white/40 bg-white/70 p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] backdrop-blur-[25px] sm:p-10">
              <div className="mb-8 text-center">
                <h2 className="mb-1 text-3xl font-bold tracking-[-0.02em] text-[#0e0e0e]">
                  {mode === 'login' ? t.login.welcomeBack : t.login.signUpTitle}
                </h2>
                <p className="text-sm text-[#474746]">
                  {mode === 'login' ? t.login.subtitle : t.login.signUpSubtitle}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {mode === 'signup' && (
                  <div className="space-y-1">
                    <label htmlFor="fullName" className="ml-1 text-xs font-semibold uppercase tracking-[0.1em] text-[#2a2a2a]">
                      {t.login.fullName}
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      placeholder="Jean Dupont"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full rounded-xl border border-[#e5e2e1] bg-white px-4 py-3 text-base text-[#0e0e0e] transition-all placeholder:text-[#c8c6c5] focus:border-[#b0d500] focus:outline-none focus:ring-0 focus:shadow-[0_0_15px_rgba(212,255,0,0.3)]"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label htmlFor="email" className="ml-1 text-xs font-semibold uppercase tracking-[0.1em] text-[#2a2a2a]">
                    {t.login.email}
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="nom@itmpanel.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-[#e5e2e1] bg-white px-4 py-3 text-base text-[#0e0e0e] transition-all placeholder:text-[#c8c6c5] focus:border-[#b0d500] focus:outline-none focus:ring-0 focus:shadow-[0_0_15px_rgba(212,255,0,0.3)]"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between px-1">
                    <label htmlFor="password" className="text-xs font-semibold uppercase tracking-[0.1em] text-[#2a2a2a]">
                      {t.login.password}
                    </label>
                    {mode === 'login' && (
                      <button type="button" className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#b0d500] hover:underline">
                        {t.login.forgotPassword}
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl border border-[#e5e2e1] bg-white px-4 py-3 pr-11 text-base text-[#0e0e0e] transition-all placeholder:text-[#c8c6c5] focus:border-[#b0d500] focus:outline-none focus:ring-0 focus:shadow-[0_0_15px_rgba(212,255,0,0.3)]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#474746] transition-colors hover:text-[#0e0e0e]"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {mode === 'signup' && (
                  <div className="space-y-1">
                    <label htmlFor="confirmPassword" className="ml-1 text-xs font-semibold uppercase tracking-[0.1em] text-[#2a2a2a]">
                      {t.login.confirmPassword}
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full rounded-xl border border-[#e5e2e1] bg-white px-4 py-3 pr-11 text-base text-[#0e0e0e] transition-all placeholder:text-[#c8c6c5] focus:border-[#b0d500] focus:outline-none focus:ring-0 focus:shadow-[0_0_15px_rgba(212,255,0,0.3)]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#474746] transition-colors hover:text-[#0e0e0e]"
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {mode === 'login' && (
                  <div className="flex items-center gap-2 px-1 py-1">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked === true)}
                      className="border-[#e5e2e1] data-[state=checked]:border-[#0e0e0e] data-[state=checked]:bg-[#0e0e0e] data-[state=checked]:text-[#b0d500]"
                    />
                    <label htmlFor="remember" className="cursor-pointer text-sm text-[#2a2a2a]">
                      {t.login.rememberMe}
                    </label>
                  </div>
                )}

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-xl bg-[#0e0e0e] py-4 text-base font-normal text-white shadow-xl transition-all duration-300 hover:bg-black hover:shadow-2xl active:scale-[0.98] disabled:opacity-70"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      {mode === 'login' ? t.login.signingIn : t.login.signingUp}
                    </span>
                  ) : (
                    mode === 'login' ? t.login.signIn : t.login.signUp
                  )}
                </button>
              </form>

              <div className="mt-8 border-t border-[#e5e2e1] pt-6 text-center">
                {mode === 'login' ? (
                  <p className="text-sm text-[#474746]">
                    {t.login.noAccount}{' '}
                    <button type="button" onClick={switchToSignup} className="ml-1 font-bold text-[#b0d500] hover:underline">
                      {t.login.createOne}
                    </button>
                  </p>
                ) : (
                  <p className="text-sm text-[#474746]">
                    {t.login.hasAccount}{' '}
                    <button type="button" onClick={switchToLogin} className="font-bold text-[#b0d500] hover:underline">
                      {t.login.signInLink}
                    </button>
                  </p>
                )}
              </div>
            </div>

            {mode === 'login' && (
              <div className="mt-8">
                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#e5e2e1]" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase tracking-[0.1em]">
                    <span className="bg-white px-3 text-[#474746]">{t.login.orContinueWith}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    className="flex items-center justify-center gap-2 rounded-xl border border-[#e5e2e1] bg-white px-4 py-3 text-sm font-medium text-[#0e0e0e] transition-colors hover:bg-[#fafafa]"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    {t.login.continueWithGoogle}
                  </button>
                  <button
                    type="button"
                    className="flex items-center justify-center gap-2 rounded-xl border border-[#e5e2e1] bg-white px-4 py-3 text-sm font-medium text-[#0e0e0e] transition-colors hover:bg-[#fafafa]"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 23 23" aria-hidden>
                      <path fill="#f35325" d="M1 1h10v10H1z" />
                      <path fill="#81bc06" d="M12 1h10v10H12z" />
                      <path fill="#05a6f0" d="M1 12h10v10H1z" />
                      <path fill="#ffba08" d="M12 12h10v10H12z" />
                    </svg>
                    {t.login.continueWithMicrosoft}
                  </button>
                </div>
              </div>
            )}
          </div>

          <footer className="relative z-10 mt-10 flex w-full max-w-md flex-col items-center justify-between gap-3 px-2 text-[10px] text-[#474746] sm:flex-row">
            <span>{t.login.footerCopyright}</span>
            <div className="flex flex-wrap justify-center gap-3">
              <button type="button" className="hover:text-[#0e0e0e]">{t.login.privacyPolicy}</button>
              <button type="button" className="hover:text-[#0e0e0e]">{t.login.termsOfUse}</button>
              <button type="button" className="hover:text-[#0e0e0e]">{t.login.legalNotice}</button>
            </div>
          </footer>
        </section>
      </main>
    </div>
  );
}
