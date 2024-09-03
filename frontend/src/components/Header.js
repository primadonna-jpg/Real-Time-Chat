import React from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from './utils/logout';

const Header = () => {
  const navigate = useNavigate();
  const access = localStorage.getItem('access');

  return (
    <header>
      <nav className="navbar navbar-expand navbar-light bg-white shadow">
        <div className="container-fluid">
          <div className="ml-4 navbar-left">
            {access ? (
              <div className="d-flex align-items-center">
                <span className="mr-3 h5 text-gray-600">Zalogowany</span>
                <button 
                  className="btn btn-outline-danger btn-sm" 
                  onClick={() => logout(navigate)}
                >
                  Wyloguj
                </button>
              </div>
            ) : (
              <span className="h5 text-gray-600">Nie jesteś zalogowany</span>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
