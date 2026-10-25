import React, { useState } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { Brand } from '../components/Brand';
import { authService } from '../services/authService';
import { User } from '../types';

interface AuthPageProps {
  onDone: (user: User) => void;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
  onLogin: (email: string, password: string) => Promise<User>;
  onRegister: (name: string, email: string, password: string, confirmPassword: string) => Promise<User>;
}

export function AuthPage({ onDone, onClose, initialMode = 'signup', onLogin, onRegister }: AuthPageProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = (): string | null => {
    if (mode === 'signup') {
      if (name.trim().length < 2) return 'Name must be at least 2 characters.';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address.';
    if (password.length < 8) return 'Password must be at least 8 characters.';
    if (mode === 'signup' && password !== confirmPassword) return 'Passwords do not match.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    setError(null);
    setLoading(true);
    try {
      if (mode === 'signup') {
        const user = await onRegister(name.trim(), email, password, confirmPassword);
        onDone(user);
      } else {
        const user = await onLogin(email, password);
        onDone(user);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-backdrop">
      <form className="auth-card" onSubmit={handleSubmit}>
        <button type="button" className="auth-close" onClick={onClose}>
          <X />
        </button>
        <Brand />
        <span className="eyebrow">
          {mode === 'signup' ? 'CREATE YOUR ACCOUNT' : 'WELCOME BACK'}
        </span>
        <h2>
          {mode === 'signup' ? 'Start finding your voice.' : 'Pick up your practice.'}
        </h2>
        {error && (
          <div style={{ background: '#fff0f0', border: '1px solid #ffd0d0', borderRadius: 8, padding: '10px 13px', fontSize: 12, color: '#c0392b', marginBottom: 10 }}>
            {error}
          </div>
        )}
        {mode === 'signup' && (
          <input aria-label="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            disabled={loading}
          />
        )}
        <input aria-label="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          type="email"
          required
          disabled={loading}
        />
        <input aria-label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password (8+ characters)"
          type="password"
          required
          disabled={loading}
        />
        {mode === 'signup' && (
          <input aria-label="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm password"
            type="password"
            required
            disabled={loading}
          />
        )}
        <button className="primary" type="submit" disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Please wait…' : (mode === 'signup' ? 'Create account' : 'Log in')}
          {!loading && <ArrowRight size={15} />}
        </button>
        <p className="auth-switch">
          {mode === 'signup' ? 'Already have an account?' : 'New to SpeakWell?'}{' '}
          <button
            type="button"
            onClick={() => { setMode(mode === 'signup' ? 'login' : 'signup'); setError(null); }}
          >
            {mode === 'signup' ? 'Log in' : 'Create one'}
          </button>
        </p>
      </form>
    </div>
  );
}
