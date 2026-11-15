import { useEffect, useRef, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '@/context/AuthContext';
import { Menu, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const getRoleLabel = (role: string) => {
  switch (role) {
    case 'ADMIN':
      return 'Administrador';
    case 'MANAGER':
      return 'Gerente';
    case 'SELLER':
      return 'Vendedor';
    default:
      return role;
  }
};

const getRoleColor = (role: string) => {
  switch (role) {
    case 'ADMIN':
      return 'bg-purple-100 text-purple-700';
    case 'MANAGER':
      return 'bg-blue-100 text-blue-700';
    case 'SELLER':
      return 'bg-green-100 text-green-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

export default function DashboardLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDemoPromptOpen, setIsDemoPromptOpen] = useState(false);
  const [demoPhrase, setDemoPhrase] = useState('');
  const [demoError, setDemoError] = useState('');
  const chordTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let waitingForC = false;

    const resetChord = () => {
      waitingForC = false;
      if (chordTimeout.current) {
        clearTimeout(chordTimeout.current);
        chordTimeout.current = null;
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key.toLowerCase() === 'x' && !event.altKey && !event.metaKey) {
        event.preventDefault();
        resetChord();
        waitingForC = true;
        chordTimeout.current = setTimeout(resetChord, 1500);
        return;
      }

      if (!waitingForC) return;
      if (event.key.toLowerCase() === 'c') {
        event.preventDefault();
        resetChord();
        setDemoPhrase('');
        setDemoError('');
        setIsDemoPromptOpen(true);
      } else if (event.key !== 'Control' && event.key !== 'Shift') {
        resetChord();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      resetChord();
    };
  }, []);

  const submitDemoPhrase = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (demoPhrase.trim().toLowerCase() !== 'hesoyam') {
      setDemoError('La palabra no es correcta.');
      return;
    }

    setIsDemoPromptOpen(false);
    navigate('/dashboard/users', { state: { usersDemoMode: true } });
  };
  
  return (
    <>
      <div className="h-[100dvh] overflow-hidden bg-slate-50">
        <div className="flex h-full min-w-0">
        {/* Sidebar */}
        <aside className="hidden h-full min-h-0 shrink-0 p-4 md:flex md:w-72">
          <Sidebar />
        </aside>

        {/* Main Content */}
        <main className="min-w-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <header className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:mb-8 sm:p-6">
              <div className="flex items-start gap-3 sm:items-center sm:justify-between">
                <button
                  type="button"
                  aria-label="Abrir menú"
                  aria-expanded={isMobileMenuOpen}
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 md:hidden"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">
                      Bienvenido, {user?.name}
                    </h1>
                    <span className={`hidden rounded-full px-3 py-1 text-sm font-medium sm:inline-flex ${getRoleColor(user?.role || '')}`}>
                      {getRoleLabel(user?.role || '')}
                    </span>
                  </div>
                  <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Sucursal: {user?.branchId || 'Principal'}
                  </p>
                </div>
                <div className="hidden items-center gap-4 sm:flex">
                  <div className="text-sm text-slate-500">
                    {new Date().toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>
            </header>

            {/* Content Area */}
            <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
              <Outlet />
            </div>
          </div>
        </main>
        </div>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <button
              type="button"
              aria-label="Cerrar menú"
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute inset-0 bg-slate-950/40"
            />
            <div className="absolute inset-y-0 left-0 w-[min(18rem,85vw)] overflow-y-auto bg-white p-3 shadow-xl">
              <div className="mb-2 flex justify-end">
                <button
                  type="button"
                  aria-label="Cerrar menú"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <Sidebar onNavigate={() => setIsMobileMenuOpen(false)} />
            </div>
          </div>
        )}
      </div>
      <Dialog open={isDemoPromptOpen} onOpenChange={setIsDemoPromptOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modo de demostración</DialogTitle>
            <DialogDescription>
              Ingresa la palabra para abrir una vista de usuarios ficticios. No cambia permisos ni modifica datos.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitDemoPhrase} className="space-y-4">
            <label className="block text-sm font-medium text-slate-700" htmlFor="demo-phrase">
              Palabra de acceso
            </label>
            <input
              id="demo-phrase"
              type="password"
              autoComplete="off"
              autoFocus
              value={demoPhrase}
              onChange={(event) => {
                setDemoPhrase(event.target.value);
                setDemoError('');
              }}
              className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {demoError && <p role="alert" className="text-sm text-red-600">{demoError}</p>}
            <DialogFooter>
              <button
                type="button"
                onClick={() => setIsDemoPromptOpen(false)}
                className="h-10 rounded-md border border-slate-300 px-4 text-sm font-medium hover:bg-slate-50"
              >
                Cancelar
              </button>
              <Button type="submit">Abrir demostración</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
