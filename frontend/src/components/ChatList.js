import React, { useState, useEffect, useContext } from 'react';
import ChatWindow from './ChatWindow';  // ChatWindow
import { AuthContext } from './utils/AuthProvider';
import UserSelectModal from './UserSelectModal';
import  {NotificationContext}  from './utils/NotificationProvider';

const ChatList = () => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null); // Przechowuje wybrany czat
  const [availableUsers, setAvailableUsers] = useState([]);  // Lista użytkowników do wyboru
  const [selectedUsers, setSelectedUsers] = useState([]);    // Wybrani użytkownicy
  const [showModal, setShowModal] = useState(false);         // Stan modala
  const [errorMessage, setErrorMessage] = useState('');
  const { token, currentUserUsername, baseURL } = useContext(AuthContext);
  const { notifications, newChatNotifications } = useContext(NotificationContext);


  // useEffect(() => {
  //   //Dodanie nowego czatu do listy, gdy pojawia się w powiadomieniach
  //   newChatNotifications.forEach((newChat) => {
  //     if (!chats.find(chat => chat.id === newChat.id)) {
  //       setChats(prevChats => [...prevChats, newChat]);
        
  //     }
  //   });
    
  // }, [newChatNotifications, chats])
  
  // Pobranie listy czatów
  useEffect(() => {
    fetch(`${baseURL}/chat/rooms/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(response => {
        if (response.ok) {
          return response.json(); // return przekazuje dane do kolejnego then
        } else {
          throw new Error('Failed to fetch chats');
        }
      })
      .then(data => setChats(data))
      .catch(error => console.log(error));
      
  }, [baseURL, token, newChatNotifications]);

  // Pobranie listy dostępnych użytkowników
  useEffect(() => {
    fetch(`${baseURL}/auth/users/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Failed to fetch users');
        }
      })
      .then(data => {
        //setAvailableUsers(data.filter(user => user.username !== currentUserUsername)); ///DO POPRAWY
        setAvailableUsers(data);
        console.log('dostępni userzy',availableUsers);
        console.log(currentUserUsername);
      })
      .catch(error => console.log(error));
  }, [baseURL, token, currentUserUsername]);

  // Obsługa otwierania i zamykania modala
  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  // Obsługa tworzenia nowego czatu z wybranymi użytkownikami
  const handleCreateChat = () => {

    if (selectedUsers.length === 0) {
      setErrorMessage('Please select at least one user.');
      return;
    }
    console.log(selectedUsers);
    // fetch
    fetch(`${baseURL}/chat/rooms/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ users: selectedUsers }), // Wysyłanie listy użytkowników
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to create chat.');
        }
        return response.json();
      })
      .then(newChat => {
        setChats([...chats, newChat]);
        setSelectedUsers([]);
        setErrorMessage('');
        handleCloseModal();  // Zamknij modal po utworzeniu czatu
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

  //opuszczanie czatu
  const handleLeaveChatRoom = (chatId)=> {
    fetch(`${baseURL}/chat/rooms/${chatId}/remove_current_user/`, {
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
      
  }

 

  return (
    <div className="d-flex" style={{ height: '90vh' }}>
      {/* Lista czatów */}
      <div className="card shadow mb-4" style={{ minwidth: '30vw', maxWidth: '40vw' }}>
        <div className="card-header py-3 d-flex justify-content-between align-items-center">
          <h6 className="m-0 font-weight-bold text-primary">Your Chats</h6>
          <div>
            <button className="btn btn-primary btn-sm mt-2" onClick={handleShowModal}>
              <i className="fas fa-plus"></i> New Chat
            </button>
          </div>
        </div>
        <div className="card-body">
          <ul className="list-group">
            {chats.map(chat => (
              <li
                key={chat.id}
                className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                style={{ cursor: 'pointer' }}
              >
                <div onClick={() => setSelectedChat(chat)} className="d-flex align-items-center" style={{ flexGrow: 1 }}>
                  <span>{chat.name}</span>
                </div>
               
                <div className="d-flex align-items-center">
                  <div style={{ borderLeft: '1px solid #ccc', height: '1.5em', marginLeft: '0.3em', marginRight: '0.3em' }}></div>
                  <i
                    className="fas fa-trash-alt text-danger"
                    onClick={() => handleLeaveChatRoom(chat.id)}
                    style={{ cursor: 'pointer' }}
                  ></i>
                </div>

              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Okno czatu */}
      <div style={{ flex: 1, marginLeft: '3vw', marginRight: '3vw' }}>
        {selectedChat ? (
          <ChatWindow chat={selectedChat} token={token} currentUserUsername={currentUserUsername} baseURL={baseURL} availableUsers={availableUsers} />
        ) : (
          <div className="card shadow mb-4">
            <div className="card-body">
              <p>Select a chat to start messaging.</p>
            </div>
          </div>
        )}
      </div>

      {/* Modal do wyboru użytkowników */}
      {/* Modal do tworzenia nowego czatu */}
      <UserSelectModal
        availableUsers={availableUsers}
        selectedUsers={selectedUsers}
        setSelectedUsers={setSelectedUsers}
        showModal={showModal}
        handleClose={handleCloseModal}
        handleSubmit={handleCreateChat}
        errorMessage={errorMessage}
      />
    </div>
  );
};

export default ChatList;
