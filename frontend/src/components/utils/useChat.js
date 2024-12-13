import { useState, useEffect, useContext } from 'react';
import { fetchChats, fetchUsers } from './api';
import { NotificationContext } from './NotificationProvider';
export const useChat = (baseURL, token, currentUserUsername) => {
    const [chats, setChats] = useState([]);
    const [availableUsers, setAvailableUsers] = useState([]);
    const { newChatNotifications } = useContext(NotificationContext);

    
    useEffect(()=>{
        fetchChats(baseURL, token).then(setChats).catch(console.error);
    },[baseURL,token,newChatNotifications ]);

    useEffect(() => {
        //fetchChats(baseURL, token).then(setChats).catch(console.error);
        fetchUsers(baseURL, token).then(users =>
            setAvailableUsers(users.filter(user => user.username !== currentUserUsername))
        ).catch(console.error);
    }, [baseURL, token, currentUserUsername]);

    return { chats, availableUsers, setChats };
};
