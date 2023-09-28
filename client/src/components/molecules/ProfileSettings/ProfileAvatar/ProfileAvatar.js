import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateUser } from '../../../../redux/userSlice';
import { useTheme } from '@chakra-ui/react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Image,
  ModalFooter,
  ModalHeader,
  SimpleGrid,
} from '@chakra-ui/react';
import styles from './ProfileAvatar.module.css';

const Avatar = {
  Cat: './assets/cat.png',
  Earth: './assets/earth.jpeg',
  Man: './assets/man.png',
  Pup: './assets/pup.png',
  Robot: './assets/robot.png',
  Woman: './assets/woman.png',
};

const avatarImages = [
  Avatar.Cat,
  Avatar.Earth,
  Avatar.Man,
  Avatar.Pup,
  Avatar.Robot,
  Avatar.Woman,
];

const ProfileAvatar = ({ handleClose }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.user);
  const theme = useTheme();
  const profileImage = useSelector(state => state.user.profilePicture);
  const [selectedAvatar, setSelectedAvatar] = useState(profileImage);

  const handleSave = () => {
    const updatedUser = { profilePicture: selectedAvatar };
    dispatch(updateUser(user._id, updatedUser));
    handleClose();
  };

  return (
    <Box w="600px" color={theme.colors.profileModal.mainTextColor}>
      <ModalHeader>Avatar Settings</ModalHeader>
      <FormControl paddingInlineStart={6}>
        <FormLabel color={theme.colors.profileModal.mainFormLabelColor}>
          Choose your profile avatar
        </FormLabel>
        <SimpleGrid columns={4}>
          {avatarImages.map((image, index) => (
            <div
              key={index}
              className={styles.btn}
              style={
                selectedAvatar === image
                  ? {
                      backgroundColor:
                        theme.colors.profileModal.activeItemBackground,
                    }
                  : null
              }
              onClick={() => setSelectedAvatar(image)}
            >
              <Image
                key={index}
                borderRadius="full"
                boxSize="92px"
                src={image || ''}
                mx="auto"
                my={4}
              />
            </div>
          ))}
        </SimpleGrid>
      </FormControl>
      <ModalFooter
        paddingInlineEnd={0}
        paddingTop={6}
        color={theme.colors.button.text}
      >
        <Button
          bg={theme.colors.button.light}
          _hover={{ bg: theme.colors.button.hover }}
          color={theme.colors.button.text}
          mr={3}
          onClick={handleSave}
        >
          Save
        </Button>
        <Button
          bg={theme.colors.buttonCancel.light}
          _hover={{ bg: theme.colors.buttonCancel.hover }}
          color={theme.colors.buttonCancel.text}
          onClick={handleClose}
        >
          Cancel
        </Button>
      </ModalFooter>
    </Box>
  );
};

export default ProfileAvatar;
