import { useEffect, useRef } from "react";

export const VideoPlayer = ({remoteUser}) => {
    const ref = useRef();

    useEffect(()=>{
        remoteUser.videoTrack.play(ref.current);
    },[]);


    return (
        <div>
            UID: {remoteUser.uid}
            <div ref={ref} style={{width:'200px',height:'200px' }}>

            </div>
        </div>
    );
}