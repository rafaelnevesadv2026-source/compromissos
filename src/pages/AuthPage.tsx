import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Mail, Lock, User, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

type AuthMode = 'login' | 'signup' | 'forgot';

export default function AuthPage() {
  const { signIn, signUp, resetPassword } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nome, setNome] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error('Preencha todos os campos');
      return;
    }
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      toast.error('E-mail ou senha incorretos');
    } else {
      toast.success('Bem-vindo!');
    }
  };

  const handleSignup = async () => {
    if (!nome.trim() || !email || !password || !confirmPassword) {
      toast.error('Preencha todos os campos');
      return;
    }
    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('As senhas não conferem');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Formato de e-mail inválido');
      return;
    }
    setLoading(true);
    const { error } = await signUp(email, password, nome.trim());
    setLoading(false);
    if (error) {
      toast.error(error.message || 'Erro ao criar conta');
    } else {
      toast.success('Conta criada com sucesso!');
    }
  };

  const handleForgot = async () => {
    if (!email) {
      toast.error('Informe seu e-mail');
      return;
    }
    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);
    if (error) {
      toast.error('Erro ao enviar e-mail de recuperação');
    } else {
      toast.success('E-mail de recuperação enviado! Verifique sua caixa de entrada.');
      setMode('login');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6 animate-fade-in">
        {/* Logo */}
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold text-gradient-primary">
            MEUS COMPROMISSOS
          </h1>
          <p className="text-[11px] text-muted-foreground tracking-widest uppercase mt-1">
            Agenda Compromisso Cumprido
          </p>
        </div>

        {/* Card */}
        <div className="glass-card p-6 space-y-5">
          <div className="text-center">
            <h2 className="font-display text-lg font-semibold text-foreground">
              {mode === 'login' && 'Entrar'}
              {mode === 'signup' && 'Criar Conta'}
              {mode === 'forgot' && 'Recuperar Senha'}
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              {mode === 'login' && 'Acesse sua agenda pessoal'}
              {mode === 'signup' && 'Crie sua conta gratuita'}
              {mode === 'forgot' && 'Enviaremos um link de recuperação'}
            </p>
          </div>

          {/* Signup: Name */}
          {mode === 'signup' && (
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Nome</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  placeholder="Seu nome"
                  className="pl-9 bg-secondary border-border/50"
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">E-mail</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="pl-9 bg-secondary border-border/50"
              />
            </div>
          </div>

          {/* Password */}
          {mode !== 'forgot' && (
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••"
                  className="pl-9 pr-10 bg-secondary border-border/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Eye className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Confirm Password */}
          {mode === 'signup' && (
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Confirmar Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••"
                  className="pl-9 bg-secondary border-border/50"
                />
              </div>
            </div>
          )}

          {/* Action button */}
          <button
            onClick={mode === 'login' ? handleLogin : mode === 'signup' ? handleSignup : handleForgot}
            disabled={loading}
            className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm glow-primary hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar' : mode === 'signup' ? 'Criar Conta' : 'Enviar Link'}
          </button>

          {/* Links */}
          <div className="space-y-2 text-center">
            {mode === 'login' && (
              <>
                <button
                  onClick={() => setMode('forgot')}
                  className="text-xs text-accent hover:underline block w-full"
                >
                  Esqueci minha senha
                </button>
                <p className="text-xs text-muted-foreground">
                  Não tem conta?{' '}
                  <button onClick={() => setMode('signup')} className="text-primary hover:underline font-medium">
                    Criar conta
                  </button>
                </p>
              </>
            )}
            {mode === 'signup' && (
              <p className="text-xs text-muted-foreground">
                Já tem conta?{' '}
                <button onClick={() => setMode('login')} className="text-primary hover:underline font-medium">
                  Entrar
                </button>
              </p>
            )}
            {mode === 'forgot' && (
              <button
                onClick={() => setMode('login')}
                className="text-xs text-accent hover:underline flex items-center justify-center gap-1 w-full"
              >
                <ArrowLeft className="w-3 h-3" /> Voltar ao login
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
