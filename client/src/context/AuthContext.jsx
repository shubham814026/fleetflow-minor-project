import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    const raw = localStorage.getItem('fleetflow_auth');
    return raw ? JSON.parse(raw) : { token: null, user: null };
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem('fleetflow_auth', JSON.stringify(auth));
  }, [auth]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setAuth({ token: data.token, user: data.user });
      return data.user;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setAuth({ token: null, user: null });
    localStorage.removeItem('fleetflow_auth');
  };

  const value = useMemo(
    () => ({
      token: auth.token,
      user: auth.user,
      isAuthenticated: Boolean(auth.token),
      login,
      logout,
      loading
    }),
    [auth, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
