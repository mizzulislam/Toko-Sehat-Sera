import React from 'react';
import { Shield, UserCheck } from 'lucide-react';

interface AdminToggleProps {
  isAdmin: boolean;
  onToggle: (newIsAdmin: boolean) => void;
}

export const AdminToggle: React.FC<AdminToggleProps> = ({ isAdmin, onToggle }) => {
  const handleToggle = () => {
    const nextState = !isAdmin;
    const url = new URL(window.location.href);
    if (nextState) {
      url.searchParams.set('view', 'admin');
    } else {
      url.searchParams.delete('view');
    }
    window.history.pushState({}, '', url.toString());
    onToggle(nextState);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        id="btn-toggle-admin-mode"
        onClick={handleToggle}
        className={`h-11 px-3.5 flex items-center gap-2 rounded-lg border text-xs font-semibold transition-colors ${
          isAdmin
            ? 'border-neutral-900 bg-neutral-900 text-white'
            : 'border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100'
        }`}
        aria-pressed={isAdmin}
      >
        {isAdmin ? (
          <>
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Mode Admin Aktif</span>
          </>
        ) : (
          <>
            <UserCheck className="w-4 h-4 text-neutral-500" />
            <span>Tampilan Pembeli (?view=admin)</span>
          </>
        )}
      </button>
    </div>
  );
};
