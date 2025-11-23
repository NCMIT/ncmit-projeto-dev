
import React from 'react';
import { useDarkMode } from '../hooks/useDarkMode';
import { SunIcon, MoonIcon, HelpIcon, LogoutIcon, LogoIcon } from './common/Icon';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseClient';

interface HeaderProps {
  onShowHelp: () => void;
  session: Session | null;
}

const Header: React.FC<HeaderProps> = ({ onShowHelp, session }) => {
  const [theme, toggleTheme] = useDarkMode();

  const handleLogout = async () => {
    await supabase?.auth.signOut();
  };

  return (
    <header className="bg-white dark:bg-brand-surface-dark shadow-md transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16">
          
          {/* Left Side: Logo */}
          <div className="flex items-center z-10">
             <div className="flex items-center gap-1">
                <div className="text-gray-800 dark:text-gray-200">
                    <LogoIcon className="h-8 w-auto" />
                </div>
              </div>
          </div>

          {/* Center: Dashboard Title */}
          <div className="absolute left-1/2 transform -translate-x-1/2 top-1/2 -translate-y-1/2 pointer-events-none">
            <span className="font-extrabold text-2xl tracking-widest text-gray-400 dark:text-white">DASHBOARD</span>
          </div>

          {/* Right Side: Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4 z-10">
            {session && (
              <div className="flex items-center space-x-2">
                <span className="hidden sm:inline text-sm text-gray-600 dark:text-gray-300 truncate" title={session.user.email}>{session.user.email}</span>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-red-dark"
                  aria-label="Sair"
                  title="Sair"
                >
                  <LogoutIcon className="w-6 h-6" />
                </button>
              </div>
            )}
             <div className="flex items-center space-x-2">
                <button
                  onClick={onShowHelp}
                  className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-yellow-dark"
                  aria-label="Ajuda"
                  title="Ajuda"
                >
                  <HelpIcon className="w-6 h-6" />
                </button>
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-yellow-dark"
                  aria-label="Toggle dark mode"
                >
                  {theme === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
                </button>
             </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;