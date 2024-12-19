import React, { useState, useEffect, useRef, useContext } from 'react';
import UserSelectModal from './UserSelectModal';
import VideoCallModal from './VideoCallModal';
import  {NotificationContext}  from './utils/NotificationProvider';
import { fetchMessages, addUsers, generateVideoCallToken } from './utils/api';
import { useNavigate } from 'react-router-dom'; 

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
  const { newChatNotifications } = useContext(NotificationContext);
  
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
    console.log("kurwaa CHUJJJ");
  };


  return (
    <div className="card shadow mb-4 " style={{ maxwidth: '50vw', minWidth: '40vw'}} >
      <div className="card-header py-3">
        <h6 className="m-0 font-weight-bold text-primary">Chat with {chatNameToDisplay}</h6>
        <i
          className="fas fa-plus"
          style={{ cursor: 'pointer' }}
          onClick={()=>handleShowModal()}
        ></i>
        <i
          style={{ cursor: 'pointer' }}
          onClick={()=>handleJoinVideoCall()}
        >Video call</i>
      </div>

      <div className="card-body chat-window" ref={chatWindowRef}>
        <ul className="list-group text-list">
          {messages.map((message, index) => (
            <li 
              key={index} 
              className={`list-group-item`}>
              <strong>{message.username}:</strong> {message.content}
            </li>
          ))}
        </ul>
      </div>

      <div className="card-footer d-flex">
        <input
          type="text"
          className="form-control"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}   
        />
        <button className="btn btn-primary ml-2" onClick={handleSendMessage}>
          Send
        </button>
      </div>

      {/* Modal do wyboru użytkowników */}
      <UserSelectModal
        availableUsers={newAvailableUsers}
        selectedUsers={selectedUsers}
        setSelectedUsers={setSelectedUsers}
        showModal={showModal}
        handleClose={handleCloseModal}
        handleSubmit={handleAddUsers}
        errorMessage={errorMessage}
      />

      {/* <VideoCallModal 
        channelName={chat.name}
        userId={currentUserId}
        showVideoCall={showVideoCall}
        onCallEnd={handleEndVideoCall}
        chatId={chat.id}
        baseURL={baseURL}
        token={token}
      /> */}

    </div>
  );
};

export default ChatWindow;
