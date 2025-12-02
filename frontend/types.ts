export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export interface User {
  id: string;
  email: string;
  username?: string; // Optional display name
  role: UserRole;
  token?: string; // Simulating JWT
}

export interface UserCredentials {
  id: string;
  email: string;
  username?: string; // Optional display name
  password: string; // In production, this would be hashed
  role: UserRole;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface Item {
  id: string;
  name: string;
  defaultCategoryId: string;
}

export interface Expense {
  id: string;
  userId: string;
  itemId: string;
  itemName: string; // Denormalized for display convenience
  amount: number;
  date: string; // ISO Date string
  categoryId: string;
  receiptImageUrl?: string;
}

export interface PriceHistoryPoint {
  date: string;
  price: number;
  store?: string;
}

export interface ExpenseSummary {
  today: number;
  yesterday: number;
  last7Days: number;
  thisMonth: number;
}

export enum AppView {
  AUTH = 'AUTH',
  DASHBOARD = 'DASHBOARD',
  ADD_EXPENSE = 'ADD_EXPENSE',
  HISTORY = 'HISTORY',
  COMPARE = 'COMPARE',
  PROFILE = 'PROFILE',
}

// Gemini specific types
export interface ReceiptItem {
  name: string;
  price: number;
  category: string;
}

export interface ReceiptData {
  items: ReceiptItem[];
  total: number;
  date?: string;
}