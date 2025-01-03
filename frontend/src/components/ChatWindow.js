import React, { useState, useEffect, useRef, useContext } from 'react';
import UserSelectModal from './UserSelectModal';
import  {NotificationContext}  from './utils/NotificationProvider';
import { fetchMessages, addUsers, generateVideoCallToken } from './utils/api';
 

const ChatWindow = ({ chat, token,currentUserId, baseURL, availableUsers, isCallActive, setIsCallActive }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const ws = useRef(null);  // Ref do połączenia WebSocket
  const chatWindowRef = useRef(null);  // Ref do elementu .chat-window
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showModal, setShowModal] = useState(false); //modal
  const [newAvailableUsers, setNewAvailableUsers] = useState([]);
  const [chatNameToDisplay, setChatNameToDisplay] = useState('');
  const { newChatNotifications, activeCallNotifications } = useContext(NotificationContext);
  const [isIncomingCall, setIsIncomingCall] = useState(false);

  //zmiana wyswietlanej nazwy
  useEffect(()=>{
    newChatNotifications.forEach((newChat)=>{
      if(newChat.id === chat.id && newChat.name){
        setChatNameToDisplay(newChat.name);
      }
    });

  }, [newChatNotifications]);
  


  const connectWebSocket = ()=>{
    const roomId = encodeURIComponent(chat.id);
    const trimmedUrl = baseURL.replace(/https?:\/\//, '');
    ws.current = new WebSocket(`ws://${trimmedUrl}/ws/chat/${roomId}/?token=${token}`); //bez https
    //ws.current = new WebSocket(`wss://${trimmedUrl}/ws/chat/${roomId}/?token=${token}`); //z https

    // Obsługa odbierania wiadomości
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages(prevMessages => [...prevMessages, { content: data.message, username: data.username }]);
    };
    ws.current.onopen = () => {
      console.log('Chat WebSocket connected');
    };
    ws.current.onclose = () => {
      console.log('Chat WebSocket disconnected');
    };
  };

  useEffect(() => {
    fetchMessages(baseURL,token,chat.id)
    .then((mess)=>setMessages(mess))
    .catch(error=>{
      console.log(error);
    });

    setChatNameToDisplay(chat.name);
    if(availableUsers){
      setNewAvailableUsers(availableUsers);
    }

    ///////// łączenie WebSocket i ponowne łączenie////////
    connectWebSocket();
    const handleVisibilityChange = ()=>{
      if (document.visibilityState === "visible" && ws.current.readyState !== WebSocket.OPEN){
          console.log("Reconnecting to Chat WebSocket");
          connectWebSocket();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    console.log(chat);
    setMessages([]); 

    return () => {
      ws.current.close();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [chat.id]);

 

  useEffect(() => {
    // Funkcja przewijająca okno czatu na dół
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);  // Wywołuje się za każdym razem, gdy zmieniają się wiadomości



  useEffect(()=>{
    setIsIncomingCall(false);
    activeCallNotifications.forEach((activeCall)=>{
      if(activeCall.chat.id === chat.id){
        console.log("Ktoś tu dzwoni");
        setIsIncomingCall(true);
      }
    });
  },[chat,activeCallNotifications]);



  const handleSendMessage = () => {
    if (newMessage.trim() && ws.current) {
      // websocket send
      ws.current.send(JSON.stringify({
        message: newMessage
      }));
      setNewMessage('');  
    }
  };



  const handleKeyDown = (event) => {
    // Funkcja obsługująca wciśnięcie Enter
    if (event.key === 'Enter') {
      event.preventDefault();  // opcjonalnie, aby zapobiec nowej linii
      handleSendMessage();      // wysyłanie wiadomości
    }
  };



  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);



  const handleAddUsers = () => {
    if (selectedUsers.length === 0) {
      setErrorMessage('Please select at least one user.');
      return;
    }
    addUsers(baseURL,token,chat.id,selectedUsers)
    .then(() =>{
      setSelectedUsers([]);
      setErrorMessage('');
      handleCloseModal();
    })
    .catch(error=>{
      console.log(error);
    });

  };


  const handleJoinVideoCall = () => {
    //if (!currentUserId) return;
    // navigate(`/videoCall/${chat.id}`,{ state: { chat } });
    // setIsCallActive(true);
    if (isCallActive) return;

    const childWindow = window.open(
      `/videoCall/${chat.id}`,
      "_blank",
      "width=800,height=600,location=no,toolbar=no,menubar=no"
    );
    
    if(childWindow){
      childWindow.opener = {
        handleEndVideoCall,
      };
      setIsCallActive(true);
    }
    else{
      console.error("Couldn`t open widndow with call");
    }

  };



  const handleEndVideoCall = () => {
    setIsCallActive(false); 
    setIsIncomingCall(false);
    console.log("HANDLE VIDEO CALL END");
  };


  const renderMessages = () =>
    messages.map((msg, index) => (
      <div
        key={index}
        className={`chat-bubble ${msg.username === currentUserId ? 'chat-bubble-right' : 'chat-bubble-left'}`}
      >
        <span className="chat-bubble-username">{msg.username}</span>
        <p>{msg.content}</p>
      </div>
  ));

  return (
    <div className="chat-window-container">
      <div className="chat-header">
        <h6 className="chat-title">Chat with {chatNameToDisplay}</h6>
        <div className="header-buttons">
          <button className="add-users-btn" onClick={() => setShowModal(true)}>
            <i className="fas fa-user-plus"></i>
          </button>
          <button
            className={`video-call-btn ${isIncomingCall ? "incoming-call" : ""} ${
              isCallActive ? "active" : ""
            }`}
            onClick={handleJoinVideoCall}
            disabled={isCallActive}
          >
            <i className={isCallActive ? "fas fa-video-slash" : "fas fa-video"}></i>
          </button>
        </div>
      </div>

      <div className="chat-body" ref={chatWindowRef}>
        {renderMessages()}
      </div>

      <div className="chat-footer">
        <input
          type="text"
          className="chat-input"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className="chat-send-btn" onClick={handleSendMessage}>Send</button>
      </div>

      <UserSelectModal
        availableUsers={availableUsers}
        selectedUsers={selectedUsers}
        setSelectedUsers={setSelectedUsers}
        showModal={showModal}
        handleClose={() => setShowModal(false)}
        handleSubmit={handleAddUsers}
        errorMessage={errorMessage}
      />
    </div>
  );
};

export default ChatWindow;
