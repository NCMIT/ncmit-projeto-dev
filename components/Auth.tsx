import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { SpinnerIcon } from './common/Icon';

const Auth: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleAuth = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
        if (isLogin) {
            const { error } = await supabase!.auth.signInWithPassword({ email, password });
            if (error) throw error;
        } else {
            const { error } = await supabase!.auth.signUp({ email, password });
            if (error) throw error;
            setMessage('Cadastro realizado! Por favor, verifique seu e-mail para confirmar sua conta.');
        }
    } catch (error: any) {
      setError(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-brand-light dark:bg-brand-dark p-4">
       <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              <span className="text-brand-yellow-dark">NC</span>
              <span className="text-brand-red-dark">M</span>
              <span className="text-gray-700 dark:text-gray-300">IT</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">Seu gerenciador de notas fiscais.</p>
        </div>
      <div className="w-full max-w-sm p-8 space-y-6 bg-white dark:bg-brand-surface-dark rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
          {isLogin ? 'Bem-vindo de volta!' : 'Crie sua conta'}
        </h2>
        <form className="space-y-6" onSubmit={handleAuth}>
          <div>
            <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-yellow focus:border-brand-yellow sm:text-sm dark:bg-gray-900/50 dark:border-gray-600"
              placeholder="seu@email.com"
            />
          </div>
          <div>
            <label htmlFor="password"  className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-yellow focus:border-brand-yellow sm:text-sm dark:bg-gray-900/50 dark:border-gray-600"
              placeholder="********"
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-yellow hover:bg-brand-yellow-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-yellow-dark disabled:opacity-50"
            >
              {loading ? <SpinnerIcon className="w-5 h-5 animate-spin" /> : (isLogin ? 'Entrar' : 'Cadastrar')}
            </button>
          </div>
        </form>

        {message && <p className="text-sm text-center text-green-600 dark:text-green-400">{message}</p>}
        {error && <p className="text-sm text-center text-red-600 dark:text-red-400">{error}</p>}
        
        <p className="text-sm text-center text-gray-600 dark:text-gray-400">
          {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}
          <button onClick={() => { setIsLogin(!isLogin); setMessage(''); setError(''); }} className="font-medium text-brand-yellow-dark hover:underline ml-1">
            {isLogin ? 'Cadastre-se' : 'Faça login'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;
