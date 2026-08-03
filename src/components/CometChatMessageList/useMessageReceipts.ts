import { CometChat } from "@cometchat/chat-sdk-javascript";
import { useCallback } from "react";
import { CometChatMessageEvents } from "../../events/CometChatMessageEvents";

interface UseMessageReceiptsOptions {
  suppressed: boolean;
  onError: (error: unknown, source: string) => void;
}

/**
 * Owns every outbound message-receipt mutation made by a message list.
 * Keeping this boundary separate makes observer/read-only behavior explicit.
 */
export const useMessageReceipts = ({
  suppressed,
  onError
}: UseMessageReceiptsOptions) => {
  const markMessageRead = useCallback(
    async (message: CometChat.BaseMessage): Promise<boolean> => {
      if (suppressed) return false;

      try {
        await CometChat.markAsRead(message);
        CometChatMessageEvents.ccMessageRead.next(message);
        return true;
      } catch (error: unknown) {
        onError(error, "markAsRead");
        return false;
      }
    },
    [onError, suppressed]
  );

  const markMessageDelivered = useCallback(
    async (message: CometChat.BaseMessage): Promise<boolean> => {
      if (suppressed) return false;

      try {
        await CometChat.markAsDelivered(message);
        return true;
      } catch (error: unknown) {
        onError(error, "markAsDelivered");
        return false;
      }
    },
    [onError, suppressed]
  );

  return { markMessageRead, markMessageDelivered };
};
