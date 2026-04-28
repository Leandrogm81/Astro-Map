'use client';

import { LogOut } from 'lucide-react';

export default function LogoutButton() {
  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  return (
    <button
      onClick={handleLogout}
      className="text-xs font-bold text-red-400/70 hover:text-red-400 transition-colors flex items-center gap-1.5"
      title="Sair do AstroMap"
    >
      <LogOut className="w-3.5 h-3.5" />
      <span className="hidden md:inline">Sair</span>
    </button>
  );
}
