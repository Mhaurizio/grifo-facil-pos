export type Role = 'mesero' | 'dueño';

export interface User {
  name: string;
  role: Role;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: MenuCategory;
}

export type MenuCategory = 'Bebidas' | 'Cocina' | 'Shots' | 'Postres';

export interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
  note?: string;
}

export interface Order {
  id: string;
  tableNumber: number;
  waiterName: string;
  items: OrderItem[];
  timestamp: string;
  status: 'active' | 'sent' | 'closed';
  total: number;
}

export interface TableInfo {
  number: number;
  status: 'free' | 'occupied';
  order?: Order;
  itemCount: number;
}

export interface SaleRecord {
  timestamp: string;
  waiterName: string;
  tableNumber: number;
  items: string;
  quantities: string;
  total: number;
  splitBy: number;
  perPerson: number;
  notes: string;
}

export const DEFAULT_MENU: MenuItem[] = [
  { id: 'b1', name: 'Cerveza Nacional', price: 5000, category: 'Bebidas' },
  { id: 'b2', name: 'Cerveza Importada', price: 8000, category: 'Bebidas' },
  { id: 'b3', name: 'Agua', price: 3000, category: 'Bebidas' },
  { id: 'b4', name: 'Gaseosa', price: 4000, category: 'Bebidas' },
  { id: 'b5', name: 'Jugo Natural', price: 6000, category: 'Bebidas' },
  { id: 'b6', name: 'Limonada', price: 5000, category: 'Bebidas' },
  { id: 'c1', name: 'Hamburguesa', price: 18000, category: 'Cocina' },
  { id: 'c2', name: 'Alitas x6', price: 15000, category: 'Cocina' },
  { id: 'c3', name: 'Nachos', price: 14000, category: 'Cocina' },
  { id: 'c4', name: 'Tacos x3', price: 16000, category: 'Cocina' },
  { id: 'c5', name: 'Papas Fritas', price: 8000, category: 'Cocina' },
  { id: 'c6', name: 'Bandeja Paisa', price: 22000, category: 'Cocina' },
  { id: 's1', name: 'Aguardiente', price: 4000, category: 'Shots' },
  { id: 's2', name: 'Tequila', price: 6000, category: 'Shots' },
  { id: 's3', name: 'Jägermeister', price: 7000, category: 'Shots' },
  { id: 's4', name: 'Whisky', price: 8000, category: 'Shots' },
  { id: 'd1', name: 'Brownie', price: 8000, category: 'Postres' },
  { id: 'd2', name: 'Tres Leches', price: 9000, category: 'Postres' },
  { id: 'd3', name: 'Helado', price: 6000, category: 'Postres' },
  { id: 'd4', name: 'Cheesecake', price: 10000, category: 'Postres' },
];

export const CATEGORIES: MenuCategory[] = ['Bebidas', 'Cocina', 'Shots', 'Postres'];
