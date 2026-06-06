import { useState } from "react";

export const useCometChatVideoBubble = ({
    src = "",
}) => {
    const [posterImage, setPosterImage] = useState("");
    const [videoSrc, setVideoSrc] = useState("");

    /* 
        The purpose of this function is to update the poster image displayed on the video. 
        It sets the poster on the load event and resets the poster on the error event.
    */
    const updateImage: () => void = () => {
        try {
            setPosterImage("");
            const img = new Image();
            img.onload = () => {
                setPosterImage(img.src);
            };
            img.onerror = () => {
                setPosterImage("");
            };
            img.src = src;
        } catch (error) {
            console.error(error);
        }

        // Download video as blob so <video> doesn't need a separate network request
        if (src) {
            const xhr = new XMLHttpRequest();
            xhr.open("GET", src, true);
            xhr.responseType = "blob";
            xhr.onload = () => {
                if (xhr.status === 200 && xhr.response) {
                    setVideoSrc(URL.createObjectURL(xhr.response));
                } else {
                    setVideoSrc(src);
                }
            };
            xhr.onerror = () => {
                setVideoSrc(src);
            };
            xhr.send();
        }
    }

    return {
        posterImage,
        videoSrc,
        updateImage,
    }
}