import React, { useState } from 'react';
import { UserPlus, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

interface SignupProps {
  onSignup: (email: string, password: string, username?: string) => Promise<void>;
  onSwitchToLogin: () => void;
}

export const Signup: React.FC<SignupProps> = ({ onSignup, onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (pwd: string) => {
    return pwd.length >= 6;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    if (!validateEmail(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    if (!validatePassword(password)) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await onSignup(email.trim(), password, username.trim() || undefined);
    } catch (err: any) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 text-gray-800">
        {/* Logo/Icon */}
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-emerald-100 rounded-full">
            <UserPlus className="text-emerald-600" size={32} />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold text-center mb-2 text-gray-900">Create Account</h2>
        <p className="text-center text-gray-500 mb-8">Join SmartSpend today</p>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-red-600 text-sm">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div>
            <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`block w-full pl-10 pr-10 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all ${
                  email && !validateEmail(email)
                    ? 'border-red-300'
                    : email && validateEmail(email)
                    ? 'border-green-300'
                    : 'border-gray-300'
                }`}
                placeholder="Enter your email"
                disabled={loading}
              />
              {email && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  {validateEmail(email) ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-400" />
                  )}
                </div>
              )}
            </div>
            {email && !validateEmail(email) && (
              <p className="mt-1 text-xs text-red-500">Please enter a valid email address</p>
            )}
          </div>

          {/* Username Field (Optional) */}
          <div>
            <label htmlFor="signup-username" className="block text-sm font-medium text-gray-700 mb-2">
              Username <span className="text-gray-400 text-xs">(Optional)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="signup-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                placeholder="Choose a display name (optional)"
                disabled={loading}
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">If not provided, we'll use your email prefix</p>
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="signup-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`block w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all ${
                  password && !validatePassword(password)
                    ? 'border-red-300'
                    : password && validatePassword(password)
                    ? 'border-green-300'
                    : 'border-gray-300'
                }`}
                placeholder="Create a password (min. 6 chars)"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                disabled={loading}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {password && !validatePassword(password) && (
              <p className="mt-1 text-xs text-red-500">Password must be at least 6 characters</p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="signup-confirm-password" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="signup-confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`block w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all ${
                  confirmPassword && password !== confirmPassword
                    ? 'border-red-300'
                    : confirmPassword && password === confirmPassword && password
                    ? 'border-green-300'
                    : 'border-gray-300'
                }`}
                placeholder="Confirm your password"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                disabled={loading}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {confirmPassword && password !== confirmPassword && (
              <p className="mt-1 text-xs text-red-500">Passwords do not match</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !validateEmail(email) || !validatePassword(password) || password !== confirmPassword}
            className="w-full py-3 bg-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:bg-emerald-700 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-6"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Creating account...
              </span>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Switch to Login */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-emerald-600 font-semibold hover:text-emerald-700 hover:underline"
              disabled={loading}
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};



