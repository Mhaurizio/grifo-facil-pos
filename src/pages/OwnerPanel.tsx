import { usePOS } from '@/context/POSContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(price);

const OwnerPanel = () => {
  const { sales, orders, tables, webhookUrl, setWebhookUrl, user } = usePOS();
  const navigate = useNavigate();
  const [showConfig, setShowConfig] = useState(false);

  const todaySales = sales.filter(s => {
    const d = new Date(s.timestamp);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  });

  const dailyTotal = todaySales.reduce((s, sale) => s + sale.total, 0);
  const activeTables = tables.filter(t => t.status === 'occupied').length;

  // Top product
  const productCounts: Record<string, number> = {};
  todaySales.forEach(s => {
    const items = s.items.split(', ');
    const qtys = s.quantities.split(', ').map(Number);
    items.forEach((item, i) => {
      productCounts[item] = (productCounts[item] || 0) + (qtys[i] || 1);
    });
  });
  const topProduct = Object.entries(productCounts).sort((a, b) => b[1] - a[1])[0];

  const stats = [
    { label: 'Ventas del día', value: formatPrice(dailyTotal), icon: '💰' },
    { label: 'Órdenes hoy', value: todaySales.length.toString(), icon: '📋' },
    { label: 'Producto top', value: topProduct ? topProduct[0] : '—', icon: '🏆' },
    { label: 'Mesas activas', value: `${activeTables}/6`, icon: '🪑' },
  ];

  return (
    <div className="min-h-screen flex flex-col px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Panel del Dueño</h1>
          <p className="text-sm text-muted-foreground">Hola, {user?.name}</p>
        </div>
        <button
          onClick={() => navigate('/tables')}
          className="text-sm text-muted-foreground bg-secondary rounded-lg px-3 py-2"
        >
          Ver mesas
        </button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {stats.map(stat => (
          <div key={stat.label} className="bg-card rounded-2xl p-4 space-y-1">
            <span className="text-2xl">{stat.icon}</span>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className="text-lg font-bold text-card-foreground">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="space-y-2 mb-6">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Acciones rápidas</h2>
        {[
          { label: 'Ver mesas', icon: '🪑', action: () => navigate('/tables') },
          { label: 'Configurar webhook', icon: '⚙️', action: () => setShowConfig(true) },
        ].map(link => (
          <button
            key={link.label}
            onClick={link.action}
            className="w-full bg-card rounded-xl p-4 flex items-center gap-3 text-left"
          >
            <span className="text-xl">{link.icon}</span>
            <span className="font-medium text-card-foreground">{link.label}</span>
          </button>
        ))}
      </div>

      {/* Recent sales */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Ventas recientes</h2>
        {todaySales.length === 0 ? (
          <p className="text-sm text-muted-foreground bg-card rounded-xl p-4">No hay ventas hoy</p>
        ) : (
          todaySales.slice(-5).reverse().map((sale, i) => (
            <div key={i} className="bg-card rounded-xl p-4 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-card-foreground">Mesa {sale.tableNumber}</p>
                <p className="text-xs text-muted-foreground">{sale.waiterName} • {new Date(sale.timestamp).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              <p className="font-bold text-foreground">{formatPrice(sale.total)}</p>
            </div>
          ))
        )}
      </div>

      {/* Config modal */}
      {showConfig && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end">
          <div className="w-full bg-card rounded-t-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-card-foreground">Configuración</h3>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">URL del Webhook (Google Apps Script)</label>
              <input
                value={webhookUrl}
                onChange={e => setWebhookUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/..."
                className="w-full bg-secondary text-secondary-foreground rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground">
                Pega la URL de tu Google Apps Script para sincronizar órdenes y ventas con Google Sheets
              </p>
            </div>
            <button onClick={() => setShowConfig(false)} className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-medium">
              Guardar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerPanel;
