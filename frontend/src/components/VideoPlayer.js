import { useEffect, useRef } from "react";

export const VideoPlayer = ({ remoteUser }) => {
    const ref = useRef();

    useEffect(() => {
        if (remoteUser?.videoTrack && ref.current) {
            remoteUser.videoTrack.play(ref.current);
        }
    }, [remoteUser]);

    // Mapa UID -> Nazwa użytkownika
    const userMapping = {
        6: "Bartek",
        30: "Michal12"
    };

    // Pobieramy nazwę użytkownika na podstawie UID, jeśli nie ma – wyświetlamy UID
    const displayName = userMapping[remoteUser.uid] || `UID: ${remoteUser.uid}`;

    return (
        <div style={{ marginBottom: "20px", textAlign: "center" }}>
            <strong>{displayName}</strong> {/* Jeśli UID to 6 lub 30, pokaże nazwę, w innym przypadku UID */}
            <div 
                ref={ref} 
                style={{
                    width: "200px", 
                    height: "200px", 
                    backgroundColor: "#222", 
                    margin: "10px auto", 
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff"
                }}
            >
            </div>
        </div>
    );
};
