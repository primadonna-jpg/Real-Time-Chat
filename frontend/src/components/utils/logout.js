
export const logout = (navigate) => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    navigate('/login'); // Przekierowanie na stronę logowania
  };
  