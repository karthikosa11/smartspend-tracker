import { Category, UserRole } from './types';

export const CATEGORIES: Category[] = [
  { id: '1', name: 'Food & Dining', color: '#10B981' }, // Emerald
  { id: '2', name: 'Groceries', color: '#3B82F6' }, // Blue
  { id: '3', name: 'Transportation', color: '#F59E0B' }, // Amber
  { id: '4', name: 'Utilities', color: '#6366F1' }, // Indigo
  { id: '5', name: 'Entertainment', color: '#EC4899' }, // Pink
  { id: '6', name: 'Health', color: '#EF4444' }, // Red
  { id: '7', name: 'Other', color: '#6B7280' }, // Gray
];

export const MOCK_USER = {
  id: 'u1',
  username: 'demo_user',
  role: UserRole.USER,
  token: 'mock-jwt-token-123'
};

export const DATE_FORMAT = 'yyyy-MM-dd';
