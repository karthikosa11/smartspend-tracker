import { Expense, User, Item, PriceHistoryPoint, Category } from '../types';
import { CATEGORIES } from '../constants';
import apiRequest from './api';

// --- Auth ---

export const signup = async (email: string, password: string, username?: string): Promise<User> => {
  const user = await apiRequest<User>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, username }),
  });
  
  // Store token
  if (user.token) {
    localStorage.setItem('token', user.token);
    localStorage.setItem('user', JSON.stringify(user));
  }
  
  return user;
};

export const login = async (email: string, password: string): Promise<User> => {
  const user = await apiRequest<User>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  
  // Store token
  if (user.token) {
    localStorage.setItem('token', user.token);
    localStorage.setItem('user', JSON.stringify(user));
  }
  
  return user;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    const user = await apiRequest<User>('/auth/me');
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  } catch (error) {
    // Token invalid, clear storage
    logout();
    return null;
  }
};

// Fallback for synchronous access (for initial load)
export const getCurrentUserSync = (): User | null => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// --- Expenses ---

export const getExpenses = async (userId: string): Promise<Expense[]> => {
  return apiRequest<Expense[]>('/expenses');
};

export const addExpense = async (expense: Omit<Expense, 'id' | 'itemId'>): Promise<Expense> => {
  return apiRequest<Expense>('/expenses', {
    method: 'POST',
    body: JSON.stringify(expense),
  });
};

// --- Analysis ---

export const getItemPriceHistory = async (itemName: string): Promise<PriceHistoryPoint[]> => {
  return apiRequest<PriceHistoryPoint[]>(`/expenses/price-history?itemName=${encodeURIComponent(itemName)}`);
};

export const getAllItems = async (): Promise<Item[]> => {
  return apiRequest<Item[]>('/items');
};

export const getCategories = (): Category[] => CATEGORIES;

