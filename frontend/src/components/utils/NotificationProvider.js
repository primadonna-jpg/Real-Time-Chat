// NotificationProvider.js
import React, { createContext, useState, useEffect, useRef, useContext } from 'react';
import PropTypes from 'prop-types';
import { AuthContext } from './AuthProvider';
export const NotificationContext = createContext();

const NotificationProvider = ({ children }) => {
    const { token, baseURL } = useContext(AuthContext);
    const [notifications, setNotifications] = useState([]);
    const [newChatNotifications, setNewChatNotification] = useState([]);
    const [activeCallNotification, setActiveCallNotification] = useState([]);
    const ws = useRef(null);

    const connectWebSocket = ()=> {
        const trimmedUrl = baseURL.replace(/https?:\/\//, '');
        ws.current = new WebSocket(`ws://${trimmedUrl}/ws/notifications/?token=${token}`);


        ws.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.notification_type === "new_chat") {
                setNewChatNotification((prev) => [...prev, data.chat]);
            }
            if(data.notification_type === "active_video_call"){
                console.log('There is active call waiting');
            }
            
        };

        ws.current.onopen = () => console.log('Notification WebSocket connected');
        ws.current.onclose = () => console.log('Notification WebSocket disconnected');
    };

    useEffect(() => {
        if (!token) return;  //zapobiega incjowaniu przed posiadaniem tokena

        connectWebSocket();
        
        const handleVisibilityChange = ()=>{
            if (document.visibilityState === "visible" && ws.current.readyState !== WebSocket.OPEN){
                console.log("Reconnecting to Notification WebSocket");
                connectWebSocket();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
        if (ws.current) {
            ws.current.close();
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        }
        };

    }, [token, baseURL]);







    return (
        <NotificationContext.Provider value={{ notifications, newChatNotifications }}>
        {children}
        </NotificationContext.Provider>
    );
};

NotificationProvider.propTypes = {
children: PropTypes.node.isRequired,
};

export default NotificationProvider; // Eksport domyślny
