import type { CometChat } from "@cometchat/chat-sdk-javascript";

export type MessageTextTransformer = (message: CometChat.BaseMessage) => string | null;

let messageTextTransformer: MessageTextTransformer | null = null;

/** Registers the host application's optional display-only text override. */
export function setMessageTextTransformerFn(transformer: MessageTextTransformer | null) {
  messageTextTransformer = transformer;
}

/** A null result preserves the default text, including when no host override is registered. */
export function getMessageTextOverride(message: CometChat.BaseMessage): string | null {
  return messageTextTransformer?.(message) ?? null;
}
