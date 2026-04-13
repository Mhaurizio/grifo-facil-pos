import { useState } from 'react';
import { usePOS } from '@/context/POSContext';
import { Role } from '@/types/pos';
import { useNavigate } from 'react-router-dom';

const WAITERS = ['Carlos', 'María', 'Andrés', 'Laura', 'Jorge', 'Valentina'];

const LoginScreen = () => {
  const { setUser } = usePOS();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>('mesero');

  const handleLogin = () => {
    if (!name.trim()) return;
    setUser({ name: name.trim(), role });
    navigate(role === 'dueño' ? '/owner' : '/tables');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-8">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <div className="text-5xl mb-4">🍽️</div>
          <h1 className="text-2xl font-bold text-foreground">POS Restaurante</h1>
          <p className="text-muted-foreground text-sm">Selecciona tu nombre y rol para continuar</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Nombre</label>
            <div className="grid grid-cols-3 gap-2">
              {WAITERS.map(w => (
                <button
                  key={w}
                  onClick={() => setName(w)}
                  className={`touch-target rounded-lg px-3 py-3 text-sm font-medium transition-all ${
                    name === w
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Rol</label>
            <div className="grid grid-cols-2 gap-3">
              {([
                { value: 'mesero' as Role, label: 'Mesero', icon: '🧑‍🍳' },
                { value: 'dueño' as Role, label: 'Dueño', icon: '👔' },
              ]).map(r => (
                <button
                  key={r.value}
                  onClick={() => setRole(r.value)}
                  className={`touch-target rounded-lg px-4 py-4 text-sm font-medium transition-all flex items-center gap-2 justify-center ${
                    role === r.value
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  <span className="text-lg">{r.icon}</span>
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleLogin}
            disabled={!name.trim()}
            className="w-full touch-target rounded-lg bg-primary text-primary-foreground font-semibold py-4 text-base transition-all hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
          >
            Entrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
