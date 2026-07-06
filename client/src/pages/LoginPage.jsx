import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Loader from '../components/Loader';
import { roleHome } from '../utils/roleUtils';
import Button from '../components/ui/Button';
import FloatingInput from '../components/ui/FloatingInput';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const toast = useToast();

  const [email, setEmail] = useState('manager@fleetflow.io');
  const [password, setPassword] = useState('Password123!');

  const loginWith = async (presetEmail) => {
    try {
      const user = await login(presetEmail, 'Password123!');
      toast.success('Login successful');
      navigate(roleHome[user.role] || '/dashboard');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Login failed');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const user = await login(email, password);
      toast.success('Login successful');
      navigate(roleHome[user.role] || '/dashboard');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#f7ead6] via-[#e0c39b] to-[#c89f70] px-4 dark:from-[#040913] dark:via-[#071227] dark:to-[#0c1d37]">
      <div className="pointer-events-none absolute -left-16 top-10 h-72 w-72 rounded-full bg-fleet-tan/45 blur-3xl dark:bg-fleet-oxford/45" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-64 w-64 rounded-full bg-fleet-oxford/25 blur-3xl dark:bg-fleet-tanVivid/20" />

      <div className="relative w-full max-w-md rounded-2xl border border-fleet-tan/80 bg-fleet-cream/80 p-6 shadow-2xl shadow-fleet-oxford/10 backdrop-blur-xl dark:border-slate-700/70 dark:bg-slate-900/75 dark:shadow-black/20">
        <h1 className="text-2xl font-bold text-fleet-oxford dark:text-white">FleetFlow Login</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Secure access by role</p>

        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Button
            variant="secondary"
            className="w-full"
            disabled={loading}
            onClick={() => {
              setEmail('manager@fleetflow.io');
              setPassword('Password123!');
              loginWith('manager@fleetflow.io');
            }}
          >
            Manager Login
          </Button>
          <Button
            variant="secondary"
            className="w-full"
            disabled={loading}
            onClick={() => {
              setEmail('dispatcher@fleetflow.io');
              setPassword('Password123!');
              loginWith('dispatcher@fleetflow.io');
            }}
          >
            Dispatcher Login
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <FloatingInput label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <FloatingInput label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Login'}
          </Button>
        </form>

        <div className="mt-4 text-sm text-slate-600 dark:text-slate-400">{loading ? <Loader text="Authenticating" /> : 'Use seeded accounts for demo.'}</div>
      </div>
    </div>
  );
};

export default LoginPage;
