import React, { useState, useEffect,useContext } from 'react';
import VideoCall from './VideoCall'; // Twój komponent rozmowy wideo
import { generateVideoCallToken } from './utils/api';
import { AuthContext } from './utils/AuthProvider';
import { useParams } from 'react-router-dom';

const VideoCallPage = () => {
  const { token, baseURL,currentUserId } = useContext(AuthContext);
  const { chatId } = useParams(); //params z url
  //const { state } = useLocation(); // Odbieramy `state` z `navigate`
  //const chat = state?.chat; // Odczytujemy cały obiekt `chat` (opcjonalnie sprawdzamy, czy istnieje)
  const [videoCallToken, setVideoCallToken] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    generateVideoCallToken(baseURL, token, chatId)
    .then((data) => {
      setVideoCallToken(data.video_call_token);
      console.log(data);
      setLoading(false);
    })
    .catch((error) => console.error('Error generating video call token:', error));

    const endCall = window.opener?.handleEndVideoCall;
    // Dodaj zdarzenie `beforeunload` do wywołania `handleEndVideoCall` w rodzicu
    const handleWindowUnload = () => {
      if (endCall) {
        endCall();
      }
    };
    window.addEventListener('beforeunload', handleWindowUnload);
    // Cleanup 
    return () => {
      if (endCall) {
        endCall(); // Wywołaj funkcję z rodzica
      }
      window.removeEventListener('beforeunload', handleWindowUnload);
    };
  }, [chatId, baseURL, token]);

  const handleEndCall = () => {
    const endCall = window.opener?.handleEndVideoCall;
    if (endCall) {
      endCall();
    }
    setVideoCallToken('');
    window.close(); // Zamknij bieżące okno
  };

  if (loading) {
      return <div>Loading...</div>; 
  }

  return (
      <div>
        <h1>Video Call for Chat ID: {chatId}</h1>
        
          <VideoCall
            appId="bbef1dc19fdf472586b741cfc97ad4b5" // Twój appId
            channelName={String(chatId)}
            token={videoCallToken}
            userId={currentUserId} 
            onCallEnd={handleEndCall}
          />
        <button onClick={handleEndCall} style={{ marginTop: '20px', padding: '10px', backgroundColor: 'red', color: 'white', border: 'none', cursor: 'pointer' }}>
          End Call
        </button>
      </div>
  );
};

export default VideoCallPage;
