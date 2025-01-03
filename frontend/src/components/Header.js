import React, {useContext} from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

import { AuthContext } from './utils/AuthProvider';

const Header = () => {
  const navigate = useNavigate();
  const {token, logout} = useContext(AuthContext);
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
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
      <div className="container">
        <div className="navbar-brand d-flex align-items-center">
          <h1 className="h5 text-gray-800 mb-0">Real Time Communicator</h1>
        </div>
        <div className="d-flex align-items-center ml-auto">
          {token ? (
            <div className="d-flex align-items-center">
              <span className="mr-3 text-gray-600 font-weight-bold">
                {username}
              </span>
              <button
                className="btn btn-danger btn-sm rounded-pill"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              className="btn btn-primary btn-sm rounded-pill"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  </header>
  );
};

export default Header;
