import { CometChatUsers } from '../CometChatUsers/CometChatUsers';
import { CometChatGroupMembers } from '../CometChatGroupMembers/CometChatGroupMembers';
import { UserMemberListType } from '../../Enums/Enums';
import { JSX, useCallback, useMemo } from 'react';
import { CometChatListItem } from '../BaseComponents/CometChatListItem/CometChatListItem';
export interface MentionsProps {
  /**
   * Determines the type of list to display - either users or group members.
   * @defaultValue `UserMemberListType.users`
   */
  userMemberListType?: UserMemberListType;

  /**
   * Callback function invoked when a user or group member item is clicked.
   * @param user - The clicked user (CometChat.User) or group member (CometChat.GroupMember)
   * @returns void
   */
  onItemClick?: (user: CometChat.User | CometChat.GroupMember | null) => void;

  /**
   * A custom view to render each user or group member item in the list.
   * 
   * @param item - An instance of CometChat.User or CometChat.GroupMember to be rendered
   * @returns A JSX element representing the custom item view
   */
  itemView?: (item?: CometChat.User | CometChat.GroupMember) => JSX.Element;

  /**
   * The search keyword used to filter users or group members.
   */
  searchKeyword?: string;

  /**
   * The group instance for which to display group members.
   */
  group?: CometChat.Group;

  /**
   * A custom view to render the subtitle for each user or group member item.
   * @param item - An instance of CometChat.User or CometChat.GroupMember
   * @returns A JSX element representing the custom subtitle view
   */
  subtitleView?: (item?: CometChat.User | CometChat.GroupMember) => JSX.Element;

  /**
   * A request builder to fetch users with custom parameters.
   */
  usersRequestBuilder?: CometChat.UsersRequestBuilder;

  /**
   * Callback function invoked when the list is empty (no users or group members found).
   * 
   * @returns void
   */
  onEmpty?: () => void;

  /**
   * A request builder to fetch group members with custom parameters.
   */
  groupMemberRequestBuilder?: CometChat.GroupMembersRequestBuilder;

  /**
   * Callback function invoked when an error occurs while fetching users or group members.
   * 
   * @returns void
   */
  onError?: () => void;

  /**
   * Controls the visibility of the scrollbar in the list.
   * 
   * @defaultValue `false`
   */
  showScrollbar?: boolean;

  /** Disables the group-wide @all option. */
  disableMentionAll?: boolean;

  /** Label used for the group-wide mention. */
  mentionAllLabel?: string;
}

export function CometChatUserMemberWrapper(props: MentionsProps) {
  const {
    userMemberListType = UserMemberListType.users,
    onItemClick,
    itemView,
    searchKeyword,
    group,
    subtitleView,
    usersRequestBuilder,
    onEmpty,
    groupMemberRequestBuilder,
    onError,
    showScrollbar = false,
    disableMentionAll = false,
    mentionAllLabel = "all",
  } = props;

  const shouldShowMentionAll = useMemo(() => {
    if (
      searchKeyword?.trim() &&
      !mentionAllLabel
        .toLowerCase()
        .startsWith(searchKeyword.trim().toLowerCase())
    ) {
      return false;
    }

    return (
      !disableMentionAll &&
      userMemberListType === UserMemberListType.groupmembers &&
      Boolean(group)
    );
  }, [disableMentionAll, group, mentionAllLabel, searchKeyword, userMemberListType]);

  const handleOnEmpty = useCallback(() => {
    if (!shouldShowMentionAll) {
      onEmpty?.();
    }
  }, [onEmpty, shouldShowMentionAll]);

  return (
    <>
      {userMemberListType === UserMemberListType.users && (
        <CometChatUsers
         showScrollbar={showScrollbar}
          hideSearch={true}
          showSectionHeader={false}
          onItemClick={onItemClick}
          searchKeyword={searchKeyword}
          itemView={itemView}
          usersRequestBuilder={usersRequestBuilder}
          subtitleView={subtitleView}
          onEmpty={handleOnEmpty}
          onError={onError}
          disableLoadingState={true}
        />
      )}

      {userMemberListType === UserMemberListType.groupmembers && group && (
        <CometChatGroupMembers
          showScrollbar={showScrollbar}
          group={group}
          hideSearch={true}
          groupMemberRequestBuilder={groupMemberRequestBuilder}
          onItemClick={onItemClick}
          searchKeyword={searchKeyword}
          itemView={itemView}
          subtitleView={subtitleView}
          onEmpty={handleOnEmpty}
          firstItemView={shouldShowMentionAll ? (
            <div className="cometchat-special-mentions-list">
              <CometChatListItem
                title={`@${mentionAllLabel}`}
                subtitleView={<span>Notify everyone in this group</span>}
                leadingView={(
                  <div
                    className="cometchat-message-composer__mention-all-icon"
                    aria-hidden="true"
                  >
                    @
                  </div>
                )}
                onListItemClicked={() => onItemClick?.(null)}
              />
            </div>
          ) : undefined}
          trailingView={(entity: CometChat.GroupMember) => { return <></> }}
          onError={onError}
          disableLoadingState={true}
        />
      )}
    </>
  );
}
