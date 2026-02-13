import { useState, useId, useRef, useEffect } from "react";
import { getLocalizedString } from "../../../resources/CometChatLocalize/cometchat-localize";
import { CometChatButton } from "../CometChatButton/CometChatButton";

interface ConfirmDialogProps {
    /** The title displayed at the top of the confirm dialog. */
    title?: string;
    /** The descriptive text inside the confirm dialog. */
    messageText?: string;
    /** The text displayed on the "cancel" button. */
    cancelButtonText?: string;
    /** The text displayed on the "confirm" button. */
    confirmButtonText?: string;
    /** Callback function for when the confirm button is clicked. */
    onSubmitClick?: () => Promise<void>;

    /** Callback function for when the cancel button is clicked. */
    onCancelClick?: () => void;
}

/*
    CometChatConfirmDialog is a dialog component that includes a title, description, and action buttons.
    It can be used for displaying warning, alert, and info popups.
    It accepts 'title' and 'messageText' props to show as the title and description of the modal.
    The 'confirmButtonText' and 'cancelButtonText' props are used to name the action buttons. Also it accepts callbacks "onSubmitClick", "onCancelClick" to be triggered on confirm and cancel buttons click.
*/
const CometChatConfirmDialog = (props: ConfirmDialogProps) => {
    const {
        title = getLocalizedString("conversation_delete_title"),
        messageText = getLocalizedString("conversation_delete_subtitle"),
        cancelButtonText = getLocalizedString('conversation_delete_confirm_no'),
        confirmButtonText = getLocalizedString("conversation_delete_confirm_yes"),
        onSubmitClick,
        onCancelClick,
    } = props;
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const dialogId = useId();
    const titleId = `${dialogId}-title`;
    const descId = `${dialogId}-desc`;
    const dialogRef = useRef<HTMLDivElement>(null);
    const cancelButtonRef = useRef<HTMLDivElement>(null);

    // Focus trap and initial focus management
    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        // Focus the cancel button (safer default) when dialog opens
        const cancelBtn = dialog.querySelector('button');
        if (cancelBtn) {
            cancelBtn.focus();
        }

        // Handle focus trap
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Tab') {
                const focusableElements = dialog.querySelectorAll(
                    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
                );
                const firstElement = focusableElements[0] as HTMLElement;
                const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

                if (e.shiftKey && document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement?.focus();
                } else if (!e.shiftKey && document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement?.focus();
                }
            }
        };

        dialog.addEventListener('keydown', handleKeyDown);
        return () => dialog.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleSubmitClick = ()=>{
if(onSubmitClick){
    setIsLoading(true);
    setIsError(false);
    onSubmitClick().then(()=>{
    }).then(() => {
        setIsLoading(false);
        setIsError(false);
        if(onCancelClick){
            onCancelClick()
        }
    })
    .catch((error) => {
        setIsError(true);
        setIsLoading(false);
    });
}
    }

    return (
        <div className="cometchat" style={{width:"fit-content" , height:"fit-content"}}>
                  {isError ?   <div className="cometchat-dialog-error-view cometchat-confirm-dialog-error-view" role="alert" aria-live="assertive">
                    {getLocalizedString("conversation_delete_error")}
                </div> : null}
            <div
                ref={dialogRef}
                className="cometchat-confirm-dialog"
                role="alertdialog"
                aria-modal="true"
                aria-labelledby={titleId}
                aria-describedby={descId}
            >
                <div className="cometchat-confirm-dialog__icon-wrapper">
                    <div className="cometchat-confirm-dialog__icon-wrapper-icon" aria-hidden="true"></div>
                </div>
                <div className="cometchat-confirm-dialog__content">
                    <div id={titleId} className="cometchat-confirm-dialog__content-title">
                        {title}
                    </div>
                    <div id={descId} className="cometchat-confirm-dialog__content-description
    " >
                        {messageText}
                    </div>
                </div>
                <div className="cometchat-confirm-dialog__button-group" role="group" aria-label="Dialog actions">
                    <div ref={cancelButtonRef} className="cometchat-confirm-dialog__button-group-cancel">
                    <CometChatButton onClick={onCancelClick} text={cancelButtonText} ariaLabel={cancelButtonText}/>
                    </div>
                    <div className="cometchat-confirm-dialog__button-group-submit">
                    <CometChatButton isLoading={isLoading} onClick={handleSubmitClick} text={confirmButtonText} ariaLabel={isLoading ? "Processing..." : confirmButtonText}/>
                    </div>
                   
                </div>
            </div>
        </div>
    )
}

export { CometChatConfirmDialog };
