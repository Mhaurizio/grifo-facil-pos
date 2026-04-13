import { useState } from 'react';
import { usePOS } from '@/context/POSContext';
import { useNavigate } from 'react-router-dom';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(price);

const BillScreen = () => {
  const { tables, selectedTable, closeBill } = usePOS();
  const navigate = useNavigate();
  const [splitBy, setSplitBy] = useState(1);
  const [closing, setClosing] = useState(false);
  const [closed, setClosed] = useState(false);

  const table = tables.find(t => t.number === selectedTable);
  const order = table?.order;

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <p className="text-muted-foreground">No hay orden activa en esta mesa</p>
        <button onClick={() => navigate('/tables')} className="mt-4 text-primary font-medium">
          ← Volver a mesas
        </button>
      </div>
    );
  }

  const perPerson = Math.ceil(order.total / splitBy);

  const handleClose = async () => {
    setClosing(true);
    await closeBill(splitBy);
    setClosing(false);
    setClosed(true);
  };

  if (closed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 space-y-6">
        <div className="text-6xl">✅</div>
        <h2 className="text-2xl font-bold text-foreground">¡Cuenta cerrada!</h2>
        <p className="text-muted-foreground text-center">
          Mesa {selectedTable} — {formatPrice(order.total)}
          {splitBy > 1 && ` (${formatPrice(perPerson)} × ${splitBy} personas)`}
        </p>
        <button
          onClick={() => navigate('/tables')}
          className="touch-target rounded-lg bg-primary text-primary-foreground font-semibold px-8 py-3"
        >
          Volver a mesas
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate('/order')} className="text-sm text-muted-foreground">
          ← Orden
        </button>
        <h1 className="text-lg font-bold text-foreground">Cuenta Mesa {selectedTable}</h1>
        <div />
      </div>

      {/* Items list */}
      <div className="flex-1 space-y-2 mb-6">
        {order.items.map((item, i) => (
          <div key={i} className="bg-card rounded-xl p-4 flex justify-between">
            <div>
              <p className="font-medium text-card-foreground">{item.menuItem.name}</p>
              <p className="text-xs text-muted-foreground">× {item.quantity}</p>
              {item.note && <p className="text-xs text-warning">📝 {item.note}</p>}
            </div>
            <p className="font-semibold text-foreground">
              {formatPrice(item.menuItem.price * item.quantity)}
            </p>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="bg-card rounded-2xl p-6 space-y-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Total</span>
          <span className="text-2xl font-bold text-foreground">{formatPrice(order.total)}</span>
        </div>

        {/* Split */}
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Dividir cuenta</p>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map(n => (
              <button
                key={n}
                onClick={() => setSplitBy(n)}
                className={`flex-1 touch-target rounded-lg py-3 font-medium text-sm transition-all ${
                  splitBy === n
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground'
                }`}
              >
                {n === 1 ? 'Sin dividir' : `${n} personas`}
              </button>
            ))}
          </div>
          {splitBy > 1 && (
            <p className="text-center text-lg font-bold text-accent">
              {formatPrice(perPerson)} por persona
            </p>
          )}
        </div>
      </div>

      <button
        onClick={handleClose}
        disabled={closing}
        className="w-full touch-target rounded-lg bg-success text-success-foreground font-bold py-4 text-base shadow-lg shadow-success/20 disabled:opacity-50"
      >
        {closing ? '⏳ Cerrando...' : '✅ Cerrar cuenta'}
      </button>
    </div>
  );
};

export default BillScreen;
