import React, { createContext, useContext, useState, useCallback } from 'react';
import { User, TableInfo, Order, OrderItem, MenuItem, DEFAULT_MENU, SaleRecord } from '@/types/pos';

const DEFAULT_WAITERS = ['Carlos', 'María', 'Andrés', 'Laura', 'Jorge', 'Valentina'];

interface POSContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  tables: TableInfo[];
  menu: MenuItem[];
  currentOrder: OrderItem[];
  selectedTable: number | null;
  setSelectedTable: (t: number | null) => void;
  addItem: (item: MenuItem) => void;
  removeItem: (itemId: string) => void;
  setItemNote: (itemId: string, note: string) => void;
  sendToKitchen: () => Promise<void>;
  closeBill: (splitBy: number) => Promise<void>;
  clearCurrentOrder: () => void;
  orders: Order[];
  sales: SaleRecord[];
  webhookUrl: string;
  setWebhookUrl: (url: string) => void;
  waiters: string[];
  setWaiters: (waiters: string[]) => void;
}

const POSContext = createContext<POSContextType | null>(null);

export const usePOS = () => {
  const ctx = useContext(POSContext);
  if (!ctx) throw new Error('usePOS must be used within POSProvider');
  return ctx;
};

const INITIAL_TABLES: TableInfo[] = Array.from({ length: 6 }, (_, i) => ({
  number: i + 1,
  status: 'free' as const,
  itemCount: 0,
}));

export const POSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tables, setTables] = useState<TableInfo[]>(INITIAL_TABLES);
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [waiters, setWaiters] = useState<string[]>(DEFAULT_WAITERS);
  const menu = DEFAULT_MENU;

  const addItem = useCallback((item: MenuItem) => {
    setCurrentOrder(prev => {
      const existing = prev.find(o => o.menuItem.id === item.id);
      if (existing) {
        return prev.map(o => o.menuItem.id === item.id ? { ...o, quantity: o.quantity + 1 } : o);
      }
      return [...prev, { menuItem: item, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setCurrentOrder(prev => {
      const existing = prev.find(o => o.menuItem.id === itemId);
      if (existing && existing.quantity > 1) {
        return prev.map(o => o.menuItem.id === itemId ? { ...o, quantity: o.quantity - 1 } : o);
      }
      return prev.filter(o => o.menuItem.id !== itemId);
    });
  }, []);

  const setItemNote = useCallback((itemId: string, note: string) => {
    setCurrentOrder(prev => prev.map(o => o.menuItem.id === itemId ? { ...o, note } : o));
  }, []);

  const getTotal = () => currentOrder.reduce((sum, o) => sum + o.menuItem.price * o.quantity, 0);

  const sendToKitchen = useCallback(async () => {
    if (!selectedTable || !user || currentOrder.length === 0) return;
    const total = getTotal();
    const order: Order = {
      id: Date.now().toString(),
      tableNumber: selectedTable,
      waiterName: user.name,
      items: [...currentOrder],
      timestamp: new Date().toISOString(),
      status: 'sent',
      total,
    };

    setOrders(prev => [...prev, order]);
    setTables(prev => prev.map(t =>
      t.number === selectedTable
        ? { ...t, status: 'occupied', order, itemCount: currentOrder.reduce((s, o) => s + o.quantity, 0) }
        : t
    ));

    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'order',
            timestamp: order.timestamp,
            waiter: user.name,
            table: selectedTable,
            items: currentOrder.map(o => o.menuItem.name).join(', '),
            quantities: currentOrder.map(o => o.quantity).join(', '),
            total,
            notes: currentOrder.filter(o => o.note).map(o => `${o.menuItem.name}: ${o.note}`).join('; '),
          }),
          mode: 'no-cors',
        });
      } catch (e) {
        console.error('Webhook error:', e);
      }
    }

    setCurrentOrder([]);
  }, [selectedTable, user, currentOrder, webhookUrl]);

  const closeBill = useCallback(async (splitBy: number) => {
    if (!selectedTable || !user) return;
    const table = tables.find(t => t.number === selectedTable);
    if (!table?.order) return;
    const total = table.order.total;
    const perPerson = Math.ceil(total / splitBy);

    const sale: SaleRecord = {
      timestamp: new Date().toISOString(),
      waiterName: user.name,
      tableNumber: selectedTable,
      items: table.order.items.map(o => o.menuItem.name).join(', '),
      quantities: table.order.items.map(o => o.quantity).join(', '),
      total,
      splitBy,
      perPerson,
      notes: table.order.items.filter(o => o.note).map(o => `${o.menuItem.name}: ${o.note}`).join('; '),
    };

    setSales(prev => [...prev, sale]);
    setTables(prev => prev.map(t =>
      t.number === selectedTable ? { ...t, status: 'free', order: undefined, itemCount: 0 } : t
    ));

    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'sale', ...sale }),
          mode: 'no-cors',
        });
      } catch (e) {
        console.error('Webhook error:', e);
      }
    }
  }, [selectedTable, user, tables, webhookUrl]);

  const clearCurrentOrder = useCallback(() => setCurrentOrder([]), []);

  return (
    <POSContext.Provider value={{
      user, setUser, tables, menu, currentOrder, selectedTable, setSelectedTable,
      addItem, removeItem, setItemNote, sendToKitchen, closeBill, clearCurrentOrder,
      orders, sales, webhookUrl, setWebhookUrl, waiters, setWaiters,
    }}>
      {children}
    </POSContext.Provider>
  );
};
