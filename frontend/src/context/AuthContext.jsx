import { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setUser({ token });
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await authService.login({ email, password });
    localStorage.setItem('token', response.data.access_token);
    setUser({ token: response.data.access_token });
    return response.data;
  };

  const register = async (email, password, name) => {
    const response = await authService.register({ email, password, name });
    localStorage.setItem('token', response.data.access_token);
    setUser({ token: response.data.access_token });
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
