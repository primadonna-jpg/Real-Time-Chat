import React, { useState, useEffect } from "react";
import { createClient, createMicrophoneAndCameraTracks } from "agora-rtc-sdk-ng";

const VideoCall = ({ appId, channelName, token, userId, onCallEnd }) => {
  const [client] = useState(() => createClient({ mode: "rtc", codec: "vp8" }));
  const [localTracks, setLocalTracks] = useState([]);
  const [remoteUsers, setRemoteUsers] = useState([]);

    useEffect(() => {
        const init = async () => {
            try {
                // Dołączanie do kanału
                await client.join(appId, channelName, token, userId);

                // Tworzenie lokalnych strumieni audio i wideo
                const tracks = await createMicrophoneAndCameraTracks();
                setLocalTracks(tracks);
                await client.publish(tracks);

                // Obsługa zdarzeń użytkowników
                client.on("user-published", async (user, mediaType) => {
                    await client.subscribe(user, mediaType);
                    if (mediaType === "video") {
                        user.videoTrack.play(`remote-${user.uid}`);
                    }
                    setRemoteUsers((prev) => [...prev, user]); // Dodaj użytkownika do listy
                });

                client.on("user-unpublished", (user) => {
                    // Usuń strumień, jeśli użytkownik opuścił połączenie
                    setRemoteUsers((prev) => prev.filter((u) => u !== user));
                });
            } catch (error) {
            console.error("Failed to join channel:", error);
            }
        };

        init();

        return () => {
        // Wyczyść zasoby przy opuszczaniu
        client.leave();
        localTracks.forEach((track) => track.close());
        };
    }, [client, appId, channelName, token, userId]);

    return (
        <div>
        <div id="local-player" style={{ width: "400px", height: "300px" }}></div>
        {remoteUsers.map((user) => (
            <div
            key={user.uid}
            id={`remote-${user.uid}`}
            style={{ width: "400px", height: "300px" }}
            ></div>
        ))}
        <button onClick={() => onCallEnd()}>End Call</button>
        </div>
    );
};

export default VideoCall;
