import React, { useState, useEffect } from "react";
import { generateVideoCallToken } from "./utils/api";
//import {Modal,Button} from "react-modal";
import { Modal, Button } from "react-bootstrap";
import VideoCall from "./VideoCall";

// Ustawienie głównego elementu aplikacji dla react-modal (wymagane przez react-modal)


const VideoCallModal = ({channelName, token, userId, onCallEnd, chatId, showVideoCall,baseURL }) => {
  const [showCall, setShowCall] = useState(false);
  const [videoCallToken, setVideoCallToken] = useState('');
  const [isCallActive, setIsCallActive] = useState(false);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    setLoading(true);
    generateVideoCallToken(baseURL, token, chatId)
    .then((data) => {
        setVideoCallToken(data.video_call_token);
        setIsCallActive(true);
        console.log(data);
        setLoading(false);
    })
    .catch((error) => console.error('Error generating video call token:', error));
  }, [chatId, baseURL, token]);

  const handleEndVideoCall = () => {
    setIsCallActive(false);
    setVideoCallToken('');
  };

  if (loading) {
      return <div>Loading...</div>; 
  }

 return (
    <Modal show={showVideoCall} onHide={handleEndVideoCall}>
       <Modal.Header closeButton>
        <Modal.Title>Video Call</Modal.Title>
      </Modal.Header>
      <Modal.body>
      <h1>Video Call for Chat ID: {chatId}</h1>
      {isCallActive && (
        <VideoCall
          appId="bbef1dc19fdf472586b741cfc97ad4b5"
          channelName={channelName}
          token={videoCallToken}
          userId={userId} 
          onCallEnd={handleEndVideoCall}
        />
      )}
      </Modal.body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleEndVideoCall}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default VideoCallModal;
