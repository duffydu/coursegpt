import React from 'react';

import styles from './PromptButton.module.css';
import { Text, Button } from '@chakra-ui/react';

const PromptButton = ({ promptText, setInputText, inputRef }) => {
  return (
    <Button
      width="33%"
      minH="85px"
      bg="#42434f"
      _hover={{ bg: '#2b2b2e' }}
      border="none"
      whiteSpace="normal"
      blockSize="auto"
      px={8}
      onClick={() => {
        setInputText(promptText);
        if (inputRef.current) {
          console.log('focus');
          inputRef.current.focus();
        }
      }}
    >
      <Text
        key={promptText}
        className={styles.fadeIn}
        fontSize="md"
        fontWeight={400}
      >
        {promptText}
      </Text>
    </Button>
  );
};
export default PromptButton;
