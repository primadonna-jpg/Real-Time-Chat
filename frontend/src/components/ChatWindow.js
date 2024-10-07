import React, { useState, useEffect, useRef } from 'react';

const ChatWindow = ({ chat, token, currentUser, baseURL }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const ws = useRef(null);  // Ref do połączenia WebSocket

  useEffect(() => {
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
    
    ////////////////////////////////////
    ///////// obsługa WEBSOCKET ////////
    const roomName = encodeURIComponent(chat.name);
    const trimmedUrl = baseURL.replace(/https?:\/\//, '');
    ws.current = new WebSocket(`ws://${trimmedUrl}/ws/chat/${roomName}/?token=${token}`);

    // Obsługa odbierania wiadomości
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages(prevMessages => [...prevMessages, { content: data.message, username: data.username }]);
    };
    ws.current.onopen = () => {
      console.log('WebSocket connected');
    };
    ws.current.onclose = () => {
      console.log('WebSocket disconnected');
    };

    setMessages([]); //kiedy chat.name się zmienia tablica messeges zostaje wyczyszczona
    return () => {
      ws.current.close();
    };
  }, [chat.name]);

  const handleSendMessage = () => {
    if (newMessage.trim() && ws.current) {
      // websocket send
      ws.current.send(JSON.stringify({
        message: newMessage
      }));
      setNewMessage('');  
    }
  };

  return (
    <div className="card shadow mb-4 " style={{ maxwidth: '50vw', minWidth: '40vw'}} >
      <div className="card-header py-3">
        <h6 className="m-0 font-weight-bold text-primary">Chat with {chat.name}</h6>
      </div>

      <div className="card-body chat-window">
        <ul className="list-group text-list">
          {messages.map((message, index) => (
            <li 
              key={index} 
              className={`list-group-item ${message.username === currentUser ? ' bg-primary text-white' : ' bg-light'}`}>
              <strong>{message.username === currentUser ? 'You' : message.username}:</strong> {message.content}
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
        />
        <button className="btn btn-primary ml-2" onClick={handleSendMessage}>
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
