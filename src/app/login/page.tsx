'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Cookies from 'js-cookie';
import styles from './page.module.css';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Authenticate with Firebase
      await signInWithEmailAndPassword(auth, email, password);
      
      // 2. Set the session cookie so Middleware allows us through
      Cookies.set('leadforce_session', 'active', { expires: 7 }); // Expires in 7 days
      
      // 3. Redirect to dashboard
      router.push('/');
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>LF</div>
          <h1 className={styles.title}>LeadForce</h1>
        </div>
        <p className={styles.subtitle}>Sign in to manage your e& pipeline</p>

        {error && <div className={styles.errorBanner}>{error}</div>}

        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.inputGroup}>
            <label>Email Address</label>
            <input 
              type="email" 
              required 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="you@eand.com" 
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Password</label>
            <input 
              type="password" 
              required 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="••••••••" 
            />
          </div>

          <button type="submit" disabled={loading} className={styles.submitBtn}>
            {loading ? 'Authenticating...' : <><LogIn size={18} /> Sign In</>}
          </button>
        </form>
        
        <div className={styles.footerText}>
          Secure internal portal for Business Development.
        </div>
      </div>
    </div>
  );
}
