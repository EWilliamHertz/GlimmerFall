import { useState } from 'react';
import { Lock, Mail, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMsg('');

    if (isLogin) {
      setTimeout(() => {
        const user = email.split('@')[0];
        localStorage.setItem('glimmerfall_user', user);
        window.dispatchEvent(new Event('auth-change'));
        navigate('/play');
      }, 1000);
      return;
    }

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('glimmerfall_user', username || email.split('@')[0]);
        window.dispatchEvent(new Event('auth-change'));
        navigate('/play');
      } else {
        setStatusMsg(data.error || "Failed to register.");
      }
    } catch (err) {
      setStatusMsg("Connection to Nexus failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[70vh]">
      <div className="bg-slate-900/60 p-8 rounded-2xl border border-cyan-900/50 w-full max-w-md backdrop-blur-sm shadow-2xl">
        <h2 className="text-3xl font-bold text-white mb-2 text-center">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className="text-slate-400 text-center mb-6">
          {isLogin ? 'Enter your credentials to access the Nexus.' : 'Join the waitlist and secure your spot.'}
        </p>

        {statusMsg && (
          <div className="mb-6 p-3 rounded bg-cyan-900/30 border border-cyan-500/50 text-cyan-300 text-sm text-center">
            {statusMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                <input type="text" value={username} onChange={e => setUsername(e.target.value)} required={!isLogin} className="w-full bg-slate-950 border border-slate-800 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-cyan-500 transition-colors" placeholder="Player1" />
              </div>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-cyan-500 transition-colors" 
                placeholder="nexus@glimmerfall.com" 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
              <input type="password" required className="w-full bg-slate-950 border border-slate-800 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-cyan-500 transition-colors" placeholder="••••••••" />
            </div>
          </div>

          <button disabled={isLoading} type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 text-white font-bold py-3 rounded-lg mt-6 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all">
            {isLoading ? 'Processing...' : (isLogin ? 'Initialize Uplink' : 'Register ID')}
          </button>
        </form>

        <p className="text-center text-slate-400 mt-6 text-sm">
          {isLogin ? "Don't have an account? " : "Already registered? "}
          <button onClick={() => { setIsLogin(!isLogin); setStatusMsg(''); }} className="text-cyan-400 hover:text-cyan-300 font-bold">
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </div>
    </div>
  );
};
