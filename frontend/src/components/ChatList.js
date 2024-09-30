import React, { useState, useEffect,useContext } from 'react';
import ChatWindow from './ChatWindow';  //  ChatWindow
import { AuthContext } from './utils/AuthProvider';
const ChatList = () => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null); // Przechowuje wybrany czat
  const [newChatUser, setNewChatUser] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const {token} = useContext(AuthContext);
  
  useEffect(() => {
    // Pobieranie listy czatów użytkownika
    fetch('http://127.0.0.1:8000/chat/rooms/', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(response => response.json())
      .then(data => setChats(data))
      .catch(error => console.log(error));
  }, []);

  const handleCreateChat = () => {
    if (!newChatUser) {
      setErrorMessage('Please enter a username.');
      return;
    }

    // Tworzenie nowego czatu (POST do API)
    const token = localStorage.getItem('access');
    fetch('http://127.0.0.1:8000/chat/rooms/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ username: newChatUser }),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('User does not exist.');
        }
        return response.json();
      })
      .then(newChat => {
        setChats([...chats, newChat]);
        setNewChatUser('');
        setErrorMessage('');
      })
      .catch(error => {
        setErrorMessage(error.message);
      });
  };

  return (
    <div className="d-flex">
      {/* Lista czatów */}
      <div className="card shadow mb-4" style={{ width: '300px'}}>
        <div className="card-header py-3 d-flex justify-content-between align-items-center">
          <h6 className="m-0 font-weight-bold text-primary">Your Chats</h6>
          <div>
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Enter username"
              value={newChatUser}
              onChange={e => setNewChatUser(e.target.value)}
            />
            <button className="btn btn-primary btn-sm mt-2" onClick={handleCreateChat}>
              <i className="fas fa-plus"></i> New Chat
            </button>
            {errorMessage && <p className="text-danger mt-2">{errorMessage}</p>}
          </div>
        </div>
        <div className="card-body">
          <ul className="list-group">
            {chats.map(chat => (
              <li
                key={chat.id}
                className="list-group-item list-group-item-action"
                onClick={() => setSelectedChat(chat)}  // Ustawianie wybranego czatu
                style={{ cursor: 'pointer' }}
              >
                {chat.name}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Okno czatu */}
      <div style={{ flex: 1, marginLeft: '20px' }}>
        {selectedChat ? (
          <ChatWindow chat={selectedChat} token={token}/>  
        ) : (
          <div className="card shadow mb-4">
            <div className="card-body">
              <p>Select a chat to start messaging.</p>
            </div>
          </div>
        )}
      </div>
      
    </div>
  );
};

export default ChatList;
