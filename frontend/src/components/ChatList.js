import React, { useState, useContext } from 'react';
import { useChat } from './utils/useChat';
import { createChat, removeCurrentUser } from './utils/api';
import ChatWindow from './ChatWindow';
import UserSelectModal from './UserSelectModal';
import { AuthContext } from './utils/AuthProvider';

const ChatList = () => {
  const { token, currentUserUsername, baseURL, currentUserId } = useContext(AuthContext);
  const { chats, availableUsers, setChats } = useChat(baseURL, token, currentUserUsername);
  const [selectedChat, setSelectedChat] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);
  const [isCallActive, setIsCallActive] = useState(false);

  const handleCreateChat = () => {
    if (selectedUsers.length > 0) {
      createChat(baseURL, token, selectedUsers)
        .then((newChat) => setChats((prev) => [...prev, newChat]))
        .catch((error) => setErrorMessage(error.message))
        .finally(() => {
          setShowModal(false);
          setSelectedUsers([]);
        });
    } else {
      setErrorMessage("You need to select at least one user.");
    }
  };

  const handleLeaveChatRoom = (chatId) => {
    removeCurrentUser(baseURL, token, chatId)
      .then(() => setChats((prev) => prev.filter((chat) => chat.id !== chatId)))
      .catch((error) => setErrorMessage(error.message));
  };

  return (
    <div className="d-flex flex-column flex-md-row" style={{ minHeight: "90vh" }}>
      {/* Lista czatów */}
      <div className="card shadow mb-4 chat-list-card">
        <div className="card-header py-3">
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center">
            <h6 className="m-0 font-weight-bold text-primary mb-2 mb-sm-0">Your Chats</h6>
            <button className="btn btn-primary btn-sm" onClick={handleShowModal}>
              <i className="fas fa-plus"></i> New Chat
            </button>
          </div>
        </div>
        <div className="card-body">
          {chats.length > 0 ? (
            <ul className="list-group">
              {chats.map((chat) => (
                <li
                  key={chat.id}
                  className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                  style={{ cursor: "pointer" }}
                >
                  <div onClick={() => setSelectedChat(chat)} className="d-flex align-items-center" style={{ flexGrow: 1 }}>
                    <span>{chat.name}</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <div style={{ borderLeft: "1px solid #ccc", height: "1.5em", marginLeft: "0.3em", marginRight: "0.3em" }}></div>
                    <i
                      className="fas fa-trash-alt text-danger"
                      onClick={() => handleLeaveChatRoom(chat.id)}
                      style={{ cursor: "pointer" }}
                    ></i>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-muted mt-3">No chats available. Start a new chat!</p>
          )}
        </div>
      </div>

      {/* Okno czatu */}
      <div className="flex-grow-1 ml-md-3 mt-3 mt-md-0" >
        {selectedChat ? (
          <ChatWindow
            chat={selectedChat}
            token={token}
            currentUserUsername={currentUserUsername}
            currentUserId={currentUserId}
            baseURL={baseURL}
            availableUsers={availableUsers}
            isCallActive={isCallActive}
            setIsCallActive={setIsCallActive}
          />
        ) : (
          <div className="card shadow mb-4">
            <div className="card-body">
              <p className="text-center">Select a chat to start messaging.</p>
            </div>
          </div>
        )}
      </div>

      {/* Modal do wyboru użytkowników */}
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
