import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('mockUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const storedUsers = JSON.parse(localStorage.getItem('mockUsers') || '{}');
    if (storedUsers[email] && storedUsers[email] === password) {
      const user = { id: Math.random().toString(36).substr(2, 9), email };
      setUser(user);
      localStorage.setItem('mockUser', JSON.stringify(user));
    } else {
      throw new Error('Invalid credentials');
    }
  };

  const signup = async (email: string, password: string) => {
    const storedUsers = JSON.parse(localStorage.getItem('mockUsers') || '{}');
    if (storedUsers[email]) {
      throw new Error('User already exists');
    }
    storedUsers[email] = password;
    localStorage.setItem('mockUsers', JSON.stringify(storedUsers));
    const user = { id: Math.random().toString(36).substr(2, 9), email };
    setUser(user);
    localStorage.setItem('mockUser', JSON.stringify(user));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('mockUser');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
