import React from 'react';
import { Routes, Route} from 'react-router-dom';

import Login from './components/Login';
import Register from './components/Register';
import Header from './components/Header';

import 'bootstrap/dist/css/bootstrap.min.css';
function App() {
  return (
    <div>
      <Header />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* Inne trasy */}
      </Routes>
    </div>
  );
}

export default App;
