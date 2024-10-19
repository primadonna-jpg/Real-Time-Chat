import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

//  kontekst autoryzacji
export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const baseURL = "http://127.0.0.1:8000";
  //const baseURL = "http://192.168.100.55:8000";
  const [token, setToken] = useState(null);
  const [currentUserUsername, setUserUsername] =useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Przy montowaniu komponentu pobieramy token z localStorage
    const storedToken = localStorage.getItem('access');
    if (storedToken) {
      setToken(storedToken);
      decodeUsername(storedToken);
    }
    setLoading(false);
  }, []);

  const setNewToken = (newToken) => {
    localStorage.setItem('access', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('access');
    setToken(null);
  };

  const decodeUsername = (token) => {
    const decodedToken = jwtDecode(token);
    setUserUsername( decodedToken.username || 'Unknown');
     
  };


  //nie renderuje dzieci dopoki ładuje
  if(loading){
    return <div>Loading...</div>
  }

  return (
    <AuthContext.Provider value={{ token,currentUserUsername,baseURL, setNewToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
