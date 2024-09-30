import React, {useContext} from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

import { AuthContext } from './utils/AuthProvider';

const Header = () => {
  const navigate = useNavigate();
  const {token, setNewToken, logout} = useContext(AuthContext);
  let username = '';

  console.log(token);

  if(token){
    try{
      const decodedToken = jwtDecode(token);
      username = decodedToken.username || 'Unknown';
    }catch (e) {
      console.error('Błąd dekodowania tokenu:', e);
    }
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  }

  return (
    <header>
      <nav className="navbar navbar-expand navbar-light bg-white shadow">
        <div className="container-fluid">
          <div className="ml-4 navbar-left">
            {token ? (
              <div className="d-flex align-items-center">
                <span className="mr-3 h5 text-gray-600">{username}</span>
                <button 
                  className="btn btn-outline-danger btn-sm" 
                  onClick={() => handleLogout()}
                >
                  Logout
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
