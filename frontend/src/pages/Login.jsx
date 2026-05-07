import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Tractor, Loader2 } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await login(username, password);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-green-100 to-yellow-50 relative">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
      
      <div className="max-w-md w-full relative z-10 bg-white/80 backdrop-blur-lg p-8 sm:p-10 rounded-3xl shadow-xl">
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-primary-500/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg border border-white/30">
             <Tractor className="h-10 w-10 text-primary-700 drop-shadow-md" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 drop-shadow-sm">
            Sri Lakshmi Chennakeshava Harvester's
          </h2>
          <p className="mt-2 text-md text-gray-800 font-medium">
            Management System
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-500/20 backdrop-blur-sm border border-red-500/50 text-red-900 font-medium p-3 rounded-xl text-sm text-center shadow-sm">
              {error}
            </div>
          )}
          
          <div className="space-y-5 text-left">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1 drop-shadow-sm" htmlFor="username">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none rounded-xl relative block w-full px-4 py-3 bg-white/60 focus:bg-white/90 border border-white/50 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all sm:text-sm shadow-inner"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1 drop-shadow-sm" htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-xl relative block w-full px-4 py-3 bg-white/60 focus:bg-white/90 border border-white/50 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all sm:text-sm shadow-inner"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-md font-bold rounded-xl text-white bg-gradient-to-r from-primary-600 to-green-500 hover:from-primary-700 hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all shadow-lg hover:shadow-primary-500/40 disabled:opacity-70 transform hover:-translate-y-0.5"
            >
              {loading ? (
                <Loader2 className="animate-spin h-6 w-6 text-white" />
              ) : (
                'Sign In securely'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
<h1 style={{color: 'red'}}>NEW UI VERSION</h1>
