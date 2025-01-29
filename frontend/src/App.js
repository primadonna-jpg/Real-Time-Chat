import React from 'react';
import { Routes, Route, Navigate} from 'react-router-dom';

import Login from './components/Login';
import Register from './components/Register';
import Header from './components/Header';
import VideoCallPage from './components/VideoCallPage';

import 'bootstrap/dist/css/bootstrap.min.css';
import ChatList from './components/ChatList';
function App() {
  return (
    <div>
      <Header />
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/ChatList" element={<ChatList />} />
        <Route path="/videoCall/:chatId" element={<VideoCallPage/>} />
        {/* Inne sciezki */}
      </Routes>
    </div>
  );
}

export default App;
