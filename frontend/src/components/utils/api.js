// api.js
const BASE_HEADERS = (token) => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
});
  
export const fetchChats = (baseURL, token) => 
fetch(`${baseURL}/chat/rooms/`, {
    method: 'GET',
    headers: BASE_HEADERS(token),
}).then((res) => res.json());

export const fetchUsers = (baseURL, token) =>
fetch(`${baseURL}/auth/users/`, {
    method: 'GET',
    headers: BASE_HEADERS(token),
}).then((res) => res.json());

export const fetchMessages = (baseURL,token, chatId) =>
fetch(`${baseURL}/chat/messages/?room_id=${chatId}`, {
    method: 'GET',
    headers: BASE_HEADERS(token),
}).then((res) => res.json());



export const createChat = (baseURL, token, users) =>
fetch(`${baseURL}/chat/rooms/`, {
    method: 'POST',
    headers: BASE_HEADERS(token),
    body: JSON.stringify({ users }),
}).then((res) => res.json());

export const deleteChat = (baseURL, token, chatId) =>
fetch(`${baseURL}/chat/rooms/${chatId}/`, {
    method: 'DELETE',
    headers: BASE_HEADERS(token),
});

export const removeCurrentUser = (baseURL, token, chatId) =>
fetch(`${baseURL}/chat/rooms/${chatId}/remove_current_user/`,{
    method: 'DELETE',
    headers: BASE_HEADERS(token),
});

export const addUsers = (baseURL, token, chatId, users) =>
fetch(`${baseURL}/chat/rooms/${chatId}/add_members/`,{
    method: 'POST', 
    headers: BASE_HEADERS(token),
    body: JSON.stringify({users:users}),
});