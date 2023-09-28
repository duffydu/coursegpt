import React, { useEffect, useRef, useState } from 'react';
import styles from './RightSection.module.css';
import InfoPanel from '../InfoPanel/InfoPanel';
import ChatPanel from '../ChatPanel/ChatPanel';
import { useDispatch, useSelector } from 'react-redux';
import {
  createUserMessageInActiveChat,
  getGptResponseInChat,
  setCurrentUserInput,
} from '../../../redux/messagesSlice';
import {
  setActivePanelChat,
  setActivePanelSearch,
  setShouldFocusChatInput,
} from '../../../redux/userSlice';
import { ChevronRightIcon } from '@chakra-ui/icons';
import {
  createChatTitle,
  createChatWithSelectedDropdownCourse,
  setActiveChat,
  setFocusedChat,
} from '../../../redux/chatsSlice';
import {
  Button,
  Spinner,
  Tooltip,
  useTheme,
  Alert,
  AlertIcon,
  CloseButton,
} from '@chakra-ui/react';
import {
  setIsSearchBarVisible,
  setIsSidePanelVisible,
} from '../../../redux/uiSlice';
import SearchBarInput from '../../molecules/SearchBar/SearchBarInput';
import { HotKeys } from 'react-hotkeys';
import InputArea from '../../atoms/InputArea/InputArea';
import SearchBarNav from '../../molecules/SearchBar/SearchBarNav';

const keyMap = { SHOW_SEARCH: ['command+f', 'ctrl+f'] };

const RightSection = () => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.user);
  const activePanel = useSelector(state => state.user.activePanel);
  const isTrainingCourse = useSelector(state => state.courses.loading);
  const currentUserInput = useSelector(
    state => state.messages.currentUserInput
  );
  const isGptLoading = useSelector(state => state.messages.gptLoading);
  const selectedCourse = useSelector(
    state => state.courses.currentlySelectedDropdownCourse
  );
  const waitingFirstMessage = useSelector(
    state => state.chats.waitingFirstMessage
  );
  const activeChat = useSelector(state => state.chats.activeChat);
  const renderInput =
    (activePanel === 'CHAT' || selectedCourse) &&
    (activeChat || waitingFirstMessage);
  const inputRef = useRef(null);
  const shouldFocusChatInput = useSelector(
    state => state.user.shouldFocusChatInput
  );
  const [trainingCompleted, setTrainingCompleted] = useState(false);
  const hasBeenTraining = useRef(false);
  const isSidePanelVisible = useSelector(state => state.ui.isSidePanelVisible);
  const isSearchBarVisible = useSelector(state => state.ui.isSearchBarVisible);

  const hotKeyHandlers = {
    SHOW_SEARCH: e => {
      e.preventDefault();
      dispatch(setIsSearchBarVisible(true));
      dispatch(setActivePanelSearch());
    },
  };

  useEffect(() => {
    let timeoutId;
    if (!isTrainingCourse && trainingCompleted) {
      timeoutId = setTimeout(() => {
        setTrainingCompleted(false);
      }, 4000);
    }
    return () => clearTimeout(timeoutId);
  }, [isTrainingCourse, trainingCompleted]);

  useEffect(() => {
    if (isTrainingCourse) {
      hasBeenTraining.current = true;
    }
    if (!isTrainingCourse && hasBeenTraining.current && !trainingCompleted) {
      setTrainingCompleted(true);
    }
  }, [isTrainingCourse]);

  const onInputSubmit = async e => {
    if (e.type === 'keydown' && e.key !== 'Enter') return;
    if (!activeChat) {
      // await dispatch(createChatWithSelectedDropdownCourse(selectedCourse._id));
      await dispatch(createChatWithSelectedDropdownCourse(user._id));
    }
    dispatch(setCurrentUserInput(''));
    dispatch(setActivePanelChat());
    await dispatch(createUserMessageInActiveChat({userId: user._id, message: currentUserInput})).then(
      async newMessagePayload => {
        dispatch(setActiveChat(newMessagePayload.payload?.chat));
        dispatch(setFocusedChat(newMessagePayload.payload?.chat));
        await dispatch(getGptResponseInChat({userId: user._id, userMessageObject: newMessagePayload.payload})).then(
          async newGptMessage => {
            dispatch(createChatTitle({userId: user._id, chatId: newGptMessage.payload?.chat}));
          }
        );
      }
    );
  };

  const setInputText = value => {
    dispatch(setCurrentUserInput(value));
  };

  useEffect(() => {
    if (shouldFocusChatInput) {
      inputRef.current && inputRef.current.focus();
      dispatch(setShouldFocusChatInput(false));
    }
  }, [shouldFocusChatInput, dispatch]);

  const theme = useTheme();

  const mainPanel =
    activePanel === 'CHAT' ? (
      <ChatPanel />
    ) : (
      <InfoPanel setInputText={setInputText} inputRef={inputRef} />
    );

  return (
    <HotKeys keyMap={keyMap} handlers={hotKeyHandlers}>
      <div
        className={styles.container}
        style={
          isSidePanelVisible
            ? { background: theme.colors.chatSection.light }
            : {
                width: '100%',
                background: theme.colors.chatSection.light,
              }
        }
      >
        {!isSidePanelVisible && (
          <div className={styles.toggleSidepanelBtn}>
            <Button
              ml={2}
              bg={theme.colors.sidePanel.background}
              border={`1px solid ${theme.colors.sidePanel.text}`}
              color={theme.colors.sidePanel.text}
              _hover={{
                bg: theme.colors.sidePanel.hoverItemBackground,
              }}
              onClick={() => {
                dispatch(setIsSidePanelVisible(true));
              }}
            >
              <ChevronRightIcon />
            </Button>
          </div>
        )}
        {isTrainingCourse && (
          <Tooltip
            label="Training in progress"
            fontSize="md"
            placement="left"
            background={theme.colors.sidePanel.background}
          >
            <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
              <Spinner
                color={theme.colors.accent.light}
                speed="0.90s"
                size="lg"
                thickness="3px"
              />
            </div>
          </Tooltip>
        )}
        {trainingCompleted && (
          <Alert
            status="success"
            position="absolute"
            top="10px"
            right="10px"
            p="2"
            w="55"
            borderRadius="md"
            background={theme.colors.sidePanel.background}
            color={theme.colors.textPrimary.light}
          >
            <AlertIcon color={theme.colors.textPrimary.light} />
            Training complete!
            <CloseButton
              alignSelf="center"
              position="relative"
              onClick={() => {
                setTrainingCompleted(false);
              }}
            />
          </Alert>
        )}
        {!isGptLoading && !isSearchBarVisible && <SearchBarNav />}
        {mainPanel}
        {renderInput && (
          <InputArea
            currentUserInput={currentUserInput}
            setInputText={setInputText}
            onInputSubmit={onInputSubmit}
            inputRef={inputRef}
            disableInput={isGptLoading}
          />
        )}
        {!isGptLoading && isSearchBarVisible && <SearchBarInput />}
      </div>
    </HotKeys>
  );
};

export default RightSection;
