import { CometChat } from "@cometchat/chat-sdk-javascript";

/**
 * Central registry for the name transformer callback.
 * Kept separate from CometChatUIKit to avoid circular imports in components.
 *
 * Usage in components:
 *   import { resolveDisplayName } from "../../utils/nameTransformer";
 *   resolveDisplayName(user.getName(), user)
 */

type NameTransformerFn = (
  name: string,
  user?: CometChat.User | CometChat.GroupMember | null
) => string;

let _nameTransformer: NameTransformerFn | null = null;

/** Called by CometChatUIKit.setNameTransformer() */
export function setNameTransformerFn(fn: NameTransformerFn | null) {
  _nameTransformer = fn;
}

/**
 * Returns the display name for a user / group-member.
 * Runs the raw name through the registered transformer if one exists,
 * otherwise returns the raw name unchanged.
 */
export function resolveDisplayName(
  name: string,
  user?: CometChat.User | CometChat.GroupMember | null
): string {
  if (_nameTransformer && name) {
    return _nameTransformer(name, user);
  }
  return name ?? "";
}
