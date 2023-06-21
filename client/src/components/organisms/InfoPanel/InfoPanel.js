import React from 'react';
import PromptButton from '../../atoms/PromptButton/PromptButton';
import styles from './InfoPanel.module.css';
import { HStack, Text } from '@chakra-ui/react';
import { useSelector } from 'react-redux';

const InfoPanel = ({ setInputText, inputRef }) => {
  const selectedCourse = useSelector(
    state => state.courses.currentlySelectedDropdownCourse
  );
  const waitingFirstMessage = useSelector(
    state => state.chats.waitingFirstMessage
  );

  const renderPrompts = () => {
    return (
      <HStack mt={24} spacing="16px">
        {selectedCourse && waitingFirstMessage
          ? selectedCourse.promptTemplates?.map((prompt, i) => (
              <PromptButton
                key={i}
                promptText={prompt}
                setInputText={() => setInputText(prompt)}
                inputRef={inputRef}
              />
            ))
          : ''}
      </HStack>
    );
  };

  return (
    <div className={styles.mainPanel}>
      <Text as="b" fontSize="4xl">
        CourseGPT
      </Text>
      {renderPrompts()}
    </div>
  );
};

export default InfoPanel;
