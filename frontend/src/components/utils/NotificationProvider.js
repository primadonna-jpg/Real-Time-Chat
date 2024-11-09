// NotificationProvider.js
import React, { createContext, useState, useEffect, useRef, useContext } from 'react';
import PropTypes from 'prop-types';
import { AuthContext } from './AuthProvider';
export const NotificationContext = createContext();

const NotificationProvider = ({ children }) => {
    const { token, baseURL } = useContext(AuthContext);
    const [notifications, setNotifications] = useState([]);
    const [newChatNotifications, setNewChatNotification] = useState([]);
    const ws = useRef(null);

    useEffect(() => {
        const trimmedUrl = baseURL.replace(/https?:\/\//, '');
        ws.current = new WebSocket(`ws://${trimmedUrl}/ws/notifications/?token=${token}`);


        ws.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.notification_type === "new_chat") {
                setNewChatNotification((prev) => [...prev, data.chat]);
            }
            
        };

        ws.current.onopen = () => console.log('Notification WebSocket connected');
        ws.current.onclose = () => console.log('Notification WebSocket disconnected');

        return () => {
        if (ws.current) {
            ws.current.close();
        }
        };

    }, []);

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
