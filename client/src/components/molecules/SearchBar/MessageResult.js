import React from 'react';
import styles from './MessageResult.module.css';
import { Box, Highlight, Divider, useTheme } from '@chakra-ui/react';
import {
  setActiveChat,
  setFocusedChat,
  setHighlightMessage,
} from '../../../redux/chatsSlice';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentlySelectedDropdownCourse } from '../../../redux/coursesSlice';
import { fetchActiveChatMessages } from '../../../redux/messagesSlice';
import { setActivePanelChat } from '../../../redux/userSlice';
import mapHighlightedTextToArray from '../../../util/mapHighlightedText';
import { setIsSearchBarVisible } from '../../../redux/uiSlice';

const MessageResult = ({ result }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const user = useSelector(state => state.user);

  const highlightedTexts = mapHighlightedTextToArray(result);

  const handleClick = async e => {
    e.preventDefault();
    const chatId = result.chat;
    // set selected course to all chats
    await dispatch(setCurrentlySelectedDropdownCourse(null));
    // set selected chat to chatId
    await dispatch(setActiveChat(chatId));
    await dispatch(setFocusedChat(chatId));
    // Render messages on the right (with the message highlighted)
    await dispatch(fetchActiveChatMessages(user._id));
    // collapse search panel
    await dispatch(setActivePanelChat());
    // set ref at the messageId and autoscroll to that reference
    await dispatch(setHighlightMessage(result));
    await dispatch(setIsSearchBarVisible(false));
  };

  return (
    <>
      <Box
        className={styles.box}
        _hover={{
          background: theme.colors.sidePanel.hoverItemBackground,
          color: theme.colors.sidePanel.text,
        }}
        onClick={handleClick}
      >
        <Highlight
          query={highlightedTexts}
          styles={{
            px: '1',
            bg: theme.colors.search.highlight,
            color: theme.colors.background.dark,
            rounded: 'md',
          }}
        >
          {result.content}
        </Highlight>
      </Box>
      <Divider />
    </>
  );
};

export default MessageResult;
