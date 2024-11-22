import React, { useState, useEffect, useRef, useContext } from 'react';
import UserSelectModal from './UserSelectModal';
import  {NotificationContext}  from './utils/NotificationProvider';

const ChatWindow = ({ chat, token, currentUserUsername, baseURL, availableUsers }) => {
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
    const newChatsData = newChatNotifications.filter((newChat)=>{
      if(newChat.id === chat.id && newChat.name){
        setChatNameToDisplay(newChat.name);
      }
    });

  }, [newChatNotifications]);

  //inicjacja materiałów potrzebnych do okna czatu
  useEffect(() => {
    //pobieranie wiadomośći czatu
    fetch(`${baseURL}/chat/messages/?room_id=${chat.id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
    .then(response =>{
      if(response.ok){
        return response.json();
      }else{
        throw new Error('Failed to load previous messages');
      }
    })
    .then(data =>{
      setMessages(data);
    })
    .catch(error =>{
      console.log(error);
    });

    //wyśietlana nazwa czatu
    setChatNameToDisplay(chat.name);
    // filtr zapobiegający dodawaniu do chatu osób już dodanych
    // if(availableUsers){
    //   setNewAvailableUsers(availableUsers.filter(user => !chat.members.includes(user.id)));
    // }
    if(availableUsers){
      setNewAvailableUsers(availableUsers);
    }

    ////////////////////////////////////
    ///////// obsługa WEBSOCKET ////////
    const roomId = encodeURIComponent(chat.id);
    const trimmedUrl = baseURL.replace(/https?:\/\//, '');
    ws.current = new WebSocket(`ws://${trimmedUrl}/ws/chat/${roomId}/?token=${token}`);

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
    console.log(chat);
    setMessages([]); 
    return () => {
      ws.current.close();
    };
  }, [chat.id]);


  // Funkcja przewijająca okno czatu na dół
  useEffect(() => {
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

  // Funkcja obsługująca wciśnięcie Enter
  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();  // opcjonalnie, aby zapobiec nowej linii
      handleSendMessage();      // wysyłanie wiadomości
    }
  };

  // Obsługa otwierania i zamykania modala
  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);


  const handleAddUsers = () => {
    if (selectedUsers.length === 0) {
      setErrorMessage('Please select at least one user.');
      return;
    }

    fetch(`${baseURL}/chat/rooms/${chat.id}/add_members/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ users: selectedUsers }),
    })
    .then(response =>{
      if(!response.ok){
        throw new Error('Failed to add users');
      }
      setSelectedUsers([]);
      setErrorMessage('');
      handleCloseModal();
    })
    .catch(error =>{
      console.log(error);
    });

  }




  return (
    <div className="card shadow mb-4 " style={{ maxwidth: '50vw', minWidth: '40vw'}} >
      <div className="card-header py-3">
        <h6 className="m-0 font-weight-bold text-primary">Chat with {chatNameToDisplay}</h6>
        <i
          className="fas fa-plus"
          style={{ cursor: 'pointer' }}
          onClick={()=>handleShowModal()}
        ></i>
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

    </div>
  );
};

export default ChatWindow;
