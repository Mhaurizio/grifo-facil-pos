import { useState } from 'react';
import { usePOS } from '@/context/POSContext';
import { useNavigate } from 'react-router-dom';
import { CATEGORIES, MenuCategory } from '@/types/pos';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(price);

const OrderScreen = () => {
  const { menu, currentOrder, addItem, removeItem, setItemNote, selectedTable, tables, sendToKitchen, clearCurrentOrder } = usePOS();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<MenuCategory>('Bebidas');
  const [showNoteFor, setShowNoteFor] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [sending, setSending] = useState(false);

  const table = tables.find(t => t.number === selectedTable);
  const filteredMenu = menu.filter(m => m.category === activeCategory);
  const total = currentOrder.reduce((s, o) => s + o.menuItem.price * o.quantity, 0);
  const itemCount = currentOrder.reduce((s, o) => s + o.quantity, 0);

  const handleSend = async () => {
    setSending(true);
    await sendToKitchen();
    setSending(false);
    navigate('/tables');
  };

  const handleSaveNote = (itemId: string) => {
    setItemNote(itemId, noteText);
    setShowNoteFor(null);
    setNoteText('');
  };

  return (
    <div className="min-h-screen flex flex-col pb-[180px]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <button onClick={() => { clearCurrentOrder(); navigate('/tables'); }} className="text-sm text-muted-foreground">
            ← Mesas
          </button>
          <h1 className="text-lg font-bold text-foreground">Mesa {selectedTable}</h1>
          <span className="text-xs text-muted-foreground">
            {table?.status === 'occupied' ? '🟢 Ocupada' : '⚪ Libre'}
          </span>
        </div>
      </div>

      {/* Category tabs */}
      <div className="sticky top-[53px] z-10 bg-background/95 backdrop-blur-sm px-4 py-2 flex gap-2 overflow-x-auto">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all ${
              activeCategory === cat
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Menu items */}
      <div className="flex-1 px-4 py-3 space-y-2">
        {filteredMenu.map(item => {
          const orderItem = currentOrder.find(o => o.menuItem.id === item.id);
          const qty = orderItem?.quantity || 0;
          return (
            <div key={item.id} className="bg-card rounded-xl p-4 flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium text-card-foreground">{item.name}</p>
                <p className="text-sm text-primary font-semibold">{formatPrice(item.price)}</p>
                {orderItem?.note && (
                  <p className="text-xs text-warning mt-1">📝 {orderItem.note}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {qty > 0 && (
                  <button
                    onClick={() => setShowNoteFor(item.id)}
                    className="text-xs text-muted-foreground bg-secondary rounded-lg px-2 py-1"
                  >
                    📝
                  </button>
                )}
                <button
                  onClick={() => removeItem(item.id)}
                  disabled={qty === 0}
                  className="w-9 h-9 rounded-lg bg-secondary text-secondary-foreground font-bold text-lg flex items-center justify-center disabled:opacity-30"
                >
                  −
                </button>
                <span className="w-8 text-center font-bold text-foreground">{qty}</span>
                <button
                  onClick={() => addItem(item)}
                  className="w-9 h-9 rounded-lg bg-primary text-primary-foreground font-bold text-lg flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Note modal */}
      {showNoteFor && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end">
          <div className="w-full bg-card rounded-t-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-card-foreground">Nota para cocina</h3>
            <input
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              placeholder="Ej: sin cebolla, extra queso..."
              className="w-full bg-secondary text-secondary-foreground rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />
            <div className="flex gap-3">
              <button onClick={() => setShowNoteFor(null)} className="flex-1 py-3 rounded-lg bg-secondary text-secondary-foreground font-medium">
                Cancelar
              </button>
              <button onClick={() => handleSaveNote(showNoteFor)} className="flex-1 py-3 rounded-lg bg-primary text-primary-foreground font-medium">
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 space-y-3 z-40">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">{itemCount} productos</span>
          <span className="text-xl font-bold text-foreground">{formatPrice(total)}</span>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSend}
            disabled={currentOrder.length === 0 || sending}
            className="flex-1 touch-target rounded-lg bg-primary text-primary-foreground font-semibold py-3 text-sm disabled:opacity-40 shadow-lg shadow-primary/20"
          >
            {sending ? '⏳ Enviando...' : '🔥 Enviar a cocina'}
          </button>
          {table?.status === 'occupied' && (
            <button
              onClick={() => navigate('/bill')}
              className="touch-target rounded-lg bg-success text-success-foreground font-semibold px-5 py-3 text-sm shadow-lg shadow-success/20"
            >
              💰 Cuenta
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderScreen;
