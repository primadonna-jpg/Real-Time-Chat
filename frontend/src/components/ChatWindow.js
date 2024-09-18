import React, { useState, useEffect, useRef } from 'react';

const ChatWindow = ({ chat }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const ws = useRef(null);  // Ref do połączenia WebSocket

  useEffect(() => {
        const roomName = encodeURIComponent(chat.name);
        console.log(roomName);
        ws.current = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${roomName}/`);

        // Obsługa odbierania wiadomości
        ws.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setMessages(prevMessages => [...prevMessages, { content: data.message }]);
        };

        // Obsługa zamykania połączenia
        ws.current.onclose = () => {
            console.log('WebSocket disconnected');
        };

        // Zamykanie połączenia przy unmount
        return () => {
            ws.current.close();
        };
    }, [chat.name]);

  const handleSendMessage = () => {
    if (newMessage.trim() && ws.current) {
      // Wysyłanie wiadomości do serwera przez WebSocket
      ws.current.send(JSON.stringify({
        message: newMessage
      }));
      setNewMessage('');  // Czyścimy pole
    }
  };

  return (
    <div className="card shadow mb-4" style={{ width: '100%' }}>

      <div className="card-header py-3">
        <h6 className="m-0 font-weight-bold text-primary">Chat with {chat.name}</h6>
      </div>

      <div className="card-body chat-window">
        <ul className="list-group">
          {messages.map((message, index) => (
            <li key={index} className="list-group-item">
              {message.content}
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
