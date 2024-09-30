import React, { createContext, useState, useEffect } from 'react';

// Tworzymy kontekst autoryzacji
export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Przy montowaniu komponentu pobieramy token z localStorage
    const storedToken = localStorage.getItem('access');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const setNewToken = (newToken) => {
    localStorage.setItem('access', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('access');
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, setNewToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
