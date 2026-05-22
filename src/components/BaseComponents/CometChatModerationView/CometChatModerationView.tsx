import React, { useEffect, useRef, useState } from 'react';
import { getLocalizedString } from '../../../resources/CometChatLocalize/cometchat-localize';

interface CometChatModerationViewProps {
    message?: any;
}

const CometChatModerationView: React.FC<CometChatModerationViewProps> = ({ message }) => {
    const flaggedWords: string[] = message?.getMetadata?.()?.flagged_words
        ?? message?.metadata?.flagged_words
        ?? [];
    const elementRef = useRef<HTMLDivElement | null>(null);
    const [width, setWidth] = useState(0);

    useEffect(() => {
        // Find body-content-view (the bubble to watch)
        // Go two levels up from the moderation ref
        const parentNode = elementRef.current?.closest('.cometchat-message-bubble__body-bottom-view')?.parentNode;
        if (!parentNode) return;

        const contentNode = parentNode.querySelector('.cometchat-message-bubble__body-content-view') as HTMLElement | null;
        if (!contentNode) return;

        // Setup observer
        const observer = new ResizeObserver(entries => {
            for (const entry of entries) {
                const newWidth = entry.contentRect.width;
                setWidth(prev => prev !== newWidth ? newWidth : prev);
            }
        });
        observer.observe(contentNode);

        // Set initial width
        setWidth(contentNode.offsetWidth);

        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={elementRef}
            className="cometchat-moderation-status"
            // style={{
            //     width: width >= 240
            //         ? `calc(${width}px + var(--cometchat-padding-1) * 2)`
            //         : "240px"
            // }}
        >
            <div className='cometchat-moderation-status--header-wrapper'>
            <div className="cometchat-moderation-status__icon"></div>
            <p className="cometchat-moderation-status__message">
                {getLocalizedString("moderation_block_message")}
            </p>
            </div>
            {flaggedWords.length > 0 && (
                <div className="cometchat-moderation-status__flagged-words">
                    <span className="cometchat-moderation-status__flagged-label">Flagged word(s): </span>
                    {flaggedWords.map((word, index) => (
                        <span key={index} className="cometchat-moderation-status__flagged-word">
                            {word}{index < flaggedWords.length - 1 ? ', ' : ''}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}


export {CometChatModerationView};