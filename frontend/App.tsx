import React, { useState, useEffect } from 'react';
import { AppView, User, Expense } from './types';
import { Dashboard } from './components/Dashboard';
import { AddExpense } from './components/AddExpense';
import { ExpenseList } from './components/ExpenseList';
import { PriceComparison } from './components/PriceComparison';
import { Profile } from './components/Profile';
import { Layout } from './components/Layout';
import { Login } from './components/Login';
import { Signup } from './components/Signup';
import { login, signup, logout, getCurrentUser, getCurrentUserSync, getExpenses } from './services/dbService';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<AppView>(AppView.AUTH);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to get user from localStorage first (synchronous)
    const cachedUser = getCurrentUserSync();
    if (cachedUser) {
      setUser(cachedUser);
      setCurrentView(AppView.DASHBOARD);
    }

    // Then verify with server
    getCurrentUser()
      .then(userData => {
        if (userData) {
          setUser(userData);
          setCurrentView(AppView.DASHBOARD);
        } else {
          setCurrentView(AppView.AUTH);
        }
      })
      .catch(() => {
        setCurrentView(AppView.AUTH);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (user) {
      loadExpenses();
    }
  }, [user]);

  const loadExpenses = async () => {
    if (!user) return;
    try {
      const data = await getExpenses(user.id);
      setExpenses(data);
    } catch (error) {
      console.error('Failed to load expenses:', error);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    const userData = await login(email, password);
    setUser(userData);
    setCurrentView(AppView.DASHBOARD);
  };

  const handleSignup = async (email: string, password: string, username?: string) => {
    const userData = await signup(email, password, username);
    setUser(userData);
    setCurrentView(AppView.DASHBOARD);
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setCurrentView(AppView.AUTH);
    setExpenses([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || currentView === AppView.AUTH) {
    return (
      <>
        {authMode === 'login' ? (
          <Login 
            onLogin={handleLogin} 
            onSwitchToSignup={() => setAuthMode('signup')} 
          />
        ) : (
          <Signup 
            onSignup={handleSignup} 
            onSwitchToLogin={() => setAuthMode('login')} 
          />
        )}
      </>
    );
  }

  return (
    <Layout 
      user={user} 
      currentView={currentView} 
      onChangeView={setCurrentView}
      onLogout={handleLogout}
    >
      {currentView === AppView.DASHBOARD && <Dashboard expenses={expenses} />}
      {currentView === AppView.ADD_EXPENSE && (
        <AddExpense user={user} onExpenseAdded={loadExpenses} />
      )}
      {currentView === AppView.HISTORY && <ExpenseList expenses={expenses} />}
      {currentView === AppView.COMPARE && <PriceComparison />}
      {currentView === AppView.PROFILE && (
        <Profile user={user} expenses={expenses} onLogout={handleLogout} />
      )}
    </Layout>
  );
}

export default App;

