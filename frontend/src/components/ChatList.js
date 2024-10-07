import React, { useState, useEffect,useContext } from 'react';
import ChatWindow from './ChatWindow';  //  ChatWindow
import { AuthContext } from './utils/AuthProvider';
const ChatList = () => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null); // Przechowuje wybrany czat
  const [newChatUser, setNewChatUser] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const {token,currentUser, baseURL} = useContext(AuthContext);
  
  useEffect(() => {
    // Pobieranie listy czatów podejściem fetch.then 
    fetch(`${baseURL}/chat/rooms/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(response => {
        if(response.ok){
          return response.json();  //return przekazuje dane do kolejnego then
        }else {
          throw new Error('Failed to fetch chats');
        }
      })
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
    fetch(`${baseURL}/chat/rooms/`, {
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




  const handleDelete = (chatId) => {
    // Wywołanie API do usunięcia czatu
    fetch(`${baseURL}/chat/rooms/${chatId}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(response => {
        if (response.ok) {
          setChats(chats.filter(chat => chat.id !== chatId));
        } else {
          throw new Error('Failed to delete chat');
        }
      })
      .catch(error => {
        console.log(error);
      });
  };


  return (
    <div className="d-flex" style={{ height: '90vh' }}>
      {/* Lista czatów */}
      <div className="card shadow mb-4" style={{ minwidth: '30vw', maxWidth: '40vw'}}>
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
        <div className="card-body" >
          <ul className="list-group">
            {chats.map(chat => (
              <li
              key={chat.id}
              className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
              style={{ cursor: 'pointer' }}
            >

              <span onClick={() => setSelectedChat(chat)}>{chat.name}</span>

              <i
                className="fas fa-trash text-danger"
                onClick={() => handleDelete(chat.id)}
                style={{ cursor: 'pointer' }}
              >delete</i>
            </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Okno czatu */}
      <div style={{ flex: 1, marginLeft: '3vw', marginRight: '3vw' }}>
        {selectedChat ? (
          <ChatWindow chat={selectedChat} token={token} currentUser={currentUser} baseURL={baseURL}/>  
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
