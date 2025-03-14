import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './utils/AuthProvider';
const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const {baseURL, setNewToken} = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = { username, password };

    try {
      const response = await fetch(`${baseURL}/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });

      const data = await response.json(); 

      if (response.ok) {
        setNewToken(data.access);// authprovider
        localStorage.setItem('refresh', data.refresh);
        navigate('/chatlist'); 
      } else {
        setError(Object.values(data)[0] || 'Login failed');
      }
    } catch (error) {
      setError(`${error.message}`);
      console.log(`${error.message}`);
    }

    setUsername('');

  };




  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card mt-5">
            <div className="card-body">
              <h2 className="card-title text-center">Log in</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <input
                    type="text"
                    className="form-control"
                    id="username"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-block">
                  Submit
                </button>
                {error && <p className="text-danger mt-3">{error}</p>}
              </form>

              <a className='small' onClick={()=> navigate('/register')} >
                Create account
              </a>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
