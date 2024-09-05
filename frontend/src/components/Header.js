import React from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from './utils/logout';
import { jwtDecode } from 'jwt-decode';


const Header = () => {
  const navigate = useNavigate();
  const access = localStorage.getItem('access');
  let username = '';

  if(access){
    try{
      const decodedToken = jwtDecode(access);
      
      username = decodedToken.username || 'Unknown';
    }catch (e) {
      console.error('Błąd dekodowania tokenu:', e);
    }
  }

  return (
    <header>
      <nav className="navbar navbar-expand navbar-light bg-white shadow">
        <div className="container-fluid">
          <div className="ml-4 navbar-left">
            {access ? (
              <div className="d-flex align-items-center">
                <span className="mr-3 h5 text-gray-600">{username}</span>
                <button 
                  className="btn btn-outline-danger btn-sm" 
                  onClick={() => logout(navigate)}
                >
                  Wyloguj
                </button>
              </div>
            ) : (
              <span className="h5 text-gray-600" >Login</span>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
