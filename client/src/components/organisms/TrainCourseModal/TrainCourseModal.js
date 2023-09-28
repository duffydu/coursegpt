import React, { useState } from 'react';
import {
  Button,
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalOverlay,
  Textarea,
  useTheme,
  VStack,
} from '@chakra-ui/react';
import { trainCurrentlySelectedDropdownCourse } from '../../../redux/coursesSlice';
import { useDispatch, useSelector } from 'react-redux';

const TrainCourseModal = ({ isOpen, handleClose, selectedCourseName }) => {
  const [textAreaValue, setTextAreaValue] = useState('');
  const user = useSelector(state => state.user);
  const dispatch = useDispatch();
  const handleTextAreaChange = event => {
    setTextAreaValue(event.target.value);
  };

  function onTrain() {
    dispatch(trainCurrentlySelectedDropdownCourse({userId: user._id, content: textAreaValue}));
    setTextAreaValue('');
    handleClose();
  }

  const theme = useTheme();
  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="3xl">
      <ModalOverlay />
      <ModalContent bg={theme.colors.profileModal.mainBackground}>
        <ModalCloseButton
          color={theme.colors.profileModal.mainFormInputColor}
        />
        <VStack p={5} pt={10}>
          <Textarea
            size="lg"
            placeholder="Your text here..."
            value={textAreaValue}
            onChange={handleTextAreaChange}
            height="300px"
            color={theme.colors.profileModal.mainTextColor}
            bg={theme.colors.profileModal.mainBackground}
          />
        </VStack>
        <ModalFooter>
          <Button
            bg={theme.colors.button.light}
            color={theme.colors.button.text}
            _hover={{
              bg: theme.colors.button.hover,
              color: theme.colors.button.text,
            }}
            mr={3}
            onClick={onTrain}
          >
            Train {selectedCourseName}
          </Button>
          <Button
            bg={theme.colors.buttonCancel.light}
            color={theme.colors.buttonCancel.text}
            _hover={{
              bg: theme.colors.buttonCancel.hover,
              color: theme.colors.buttonCancel.text,
            }}
            onClick={() => {
              setTextAreaValue('');
              handleClose();
            }}
          >
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default TrainCourseModal;
