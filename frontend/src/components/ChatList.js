import React, { useState, useContext } from 'react';
import { useChat } from './utils/useChat';
import { createChat, removeCurrentUser} from './utils/api';
import ChatWindow from './ChatWindow';
import UserSelectModal from './UserSelectModal';
import { AuthContext } from './utils/AuthProvider';


const ChatList = () => {
  const { token, currentUserUsername, baseURL } = useContext(AuthContext);
  const { chats, availableUsers, setChats } = useChat(baseURL, token, currentUserUsername);
  const [selectedChat, setSelectedChat] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  
  const handleCreateChat = () => {
    if (selectedUsers.length > 0) {
      createChat(baseURL, token, selectedUsers)
        .then((newChat) => setChats((prev) => [...prev, newChat]))
        .catch((error) => setErrorMessage(error.message))
        .finally(() => {
          setShowModal(false);
          setSelectedUsers([]);
        });
    }
  };

  const handleLeaveChatRoom = (chatId) => {
    removeCurrentUser(baseURL, token, chatId).then(() =>
      setChats((prev) => prev.filter((chat) => chat.id !== chatId))
    )
    .catch((error) => setErrorMessage(error.message));
  };

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
