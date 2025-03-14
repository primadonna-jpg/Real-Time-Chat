import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './utils/AuthProvider';


const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const {baseURL} = useContext(AuthContext);
  const  navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = { username, email, password };

    try {
      const response = await fetch(`${baseURL}/auth/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });



      if (response.ok) {
        navigate('/login');
      } else {
        const data = await response.json();
        setError(Object.values(data)[0] || 'Rejestracja nieudana');
        console.log(data);
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
              <h2 className="card-title text-center">Create an account</h2>
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
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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

              <a className='small' onClick={()=> navigate('/login')} >
                Already have an account? Log in
              </a>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
