import { useEffect } from "react";
import placeholderIcon from "../../../assets/image_placeholder.png"
import { isHeicFile } from "../../../utils/heicSupport";
import { useCometChatImageBubble } from "./useCometChatImageBubble";

interface ImageBubbleProps {
    /* URL of the image to be shown. */
    src: string;
    /* image to be shown as the placeholder. */
    placeholderImage?: string;
    /* callback which is triggered on click of the image. */
    onImageClicked?: (input: { src: string }) => void;
    /* boolean to toggle bubble styling. */
    isSentByMe?: boolean;
    /* boolean flag to hide the placeholder image while loading. */
    disableLoadingState?: boolean;
}
/*
    CometChatImageBubble is a generic component used to display images. It is generally used for image messages in chat.
    It accepts the URL of the image to be shown and a callback function that is triggered when the image is clicked.
    It also accepts a placeholderImage input for the default image and a caption to be displayed with the image.
*/
const CometChatImageBubble = (props: ImageBubbleProps) => {
    const {
        src = "",
        placeholderImage = placeholderIcon,
        onImageClicked = () => { },
        isSentByMe = true,
        disableLoadingState = false
    } = props;

    // For HEIC sources, always go through the conversion hook — browsers cannot render raw HEIC.
    const needsConversion = isHeicFile(src);
    const { image, updateImage } = useCometChatImageBubble({ src, placeholderImage });

    useEffect(() => {
        if (!disableLoadingState || needsConversion) {
            updateImage();
        }
    }, [disableLoadingState, needsConversion]);

    // Use the hook's converted image for HEIC even when disableLoadingState is true.
    const displaySrc = (disableLoadingState && !needsConversion) ? src : image;

    const getImageBubbleView = () => {
        return (
            <div 
                className={`cometchat-image-bubble ${isSentByMe ? "cometchat-image-bubble-outgoing" : "cometchat-image-bubble-incoming"}`} 
                onClick={() => onImageClicked({ src })}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onImageClicked({ src }); } }}
                role="button"
                tabIndex={0}
                aria-label="View image in full screen"
            >
                <img
                    className="cometchat-image-bubble__body"
                    src={displaySrc}
                    alt="Image message"
                    onError={(e) => { (e.target as HTMLImageElement).src = placeholderImage; }}
                />
            </div >
        )
    }

    return (
        <div className="cometchat">
            {getImageBubbleView()}
        </div>
    )
}

export { CometChatImageBubble };
