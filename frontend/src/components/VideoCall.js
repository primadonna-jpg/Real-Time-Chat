import React, { useState, useEffect } from "react";
import { createClient, createMicrophoneAndCameraTracks } from "agora-rtc-sdk-ng";
import { VideoPlayer } from "./VideoPlayer";

const client = createClient({ mode: "rtc", codec: "vp8" });

const VideoCall = ({ appId, channelName, token, userId, onCallEnd }) => {
  //const [client] = useState(() => createClient({ mode: "rtc", codec: "vp8" }));
  // const [isConnected, setIsConnected] = useState(false);
  // const [hasJoined, setHasJoined] = useState(false);  // Nowe, aby śledzić, czy użytkownik już dołączył
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [localTracks, setLocalTracks] = useState([]);

  const handleUserJoined = async (user, mediaType)=>{
    await client.subscribe(user,mediaType);

    if(mediaType==='video'){
      setRemoteUsers((prev)=>[...prev,user]);
    }

    if(mediaType==='audio'){
      user.audioTrack.play();
    }
  };

  const handleUserLeft= async (user)=>{
    setRemoteUsers((prev)=> prev.filter((u)=> u.uid !== user.uid));
  }


  useEffect(()=>{
    client.on('user-published', handleUserJoined)
    client.on('user-left',handleUserLeft)

    client.join(appId, channelName, token, userId)
    .then((uid)=>{
      return createMicrophoneAndCameraTracks().then((tracks) => [uid, tracks]);
    })
    .then(([uid, tracks])=>{
      const [audioTrack, videoTrack] = tracks; //index 0 audio index 1 video
      setLocalTracks(tracks);
      setRemoteUsers((prev) => [...prev,{
        uid,
        videoTrack,
        audioTrack
      }]);
      client.publish(tracks);
    })

    return () => {
      // Zatrzymanie i zamknięcie lokalnych ścieżek
      localTracks.forEach((track) => {
        track.stop();
        track.close();
      });
  
      // Odłączenie eventów
      client.off("user-published", handleUserJoined);
      client.off("user-left", handleUserLeft);

      // Unpublish i opuszczenie kanału
      client.unpublish(localTracks).then(() => client.leave());
    };
  },[]);

  

  return (
    <div className="video-call-container">
      <div className="video-grid">
        {remoteUsers.map((remoteUser) => (
          <VideoPlayer key={remoteUser.uid} remoteUser={remoteUser} />
        ))}
      </div>
    </div>
  );
};

export default VideoCall;
