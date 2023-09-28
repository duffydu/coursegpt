import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Image,
  Input,
  ModalFooter,
  ModalHeader,
  Stack,
  useTheme,
  Select,
} from '@chakra-ui/react';
import { updateUser } from '../../../../redux/userSlice';

const ProfileUserSettings = ({ handleClose }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.user);

  const [userInfo, setUserInfo] = useState({
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    type: user.type,
    profilePicture: user.profilePicture,
  });

  const handleSave = () => {
    const updatedUser = {
      ...userInfo,
    };
    // dispatch(updateUser(updatedUser));
    dispatch(updateUser({userId: user._id, updatedUser: updatedUser}));
    handleClose();
  };

  const theme = useTheme();

  return (
    <Box color={theme.colors.profileModal.mainTextColor} w="600px">
      <ModalHeader> User Settings </ModalHeader>
      <Stack direction="row">
        <Box w="400px" m={1} justifyContent="center">
          <Image
            borderRadius="full"
            boxSize="180px"
            src={userInfo.profilePicture}
            alt="Profile Picture"
            m={3}
          />
        </Box>
        <Box w="100%">
          <Flex direction="row" spacing={5}>
            <FormControl m={4}>
              <FormLabel color={theme.colors.profileModal.mainFormLabelColor}>
                First name
              </FormLabel>
              <Input
                backgroundColor={theme.colors.profileModal.mainFormInputColor}
                borderRadius={10}
                defaultValue={userInfo.firstName}
                onChange={e =>
                  setUserInfo({ ...userInfo, firstName: e.target.value })
                }
              />
            </FormControl>
            <FormControl m={4}>
              <FormLabel color={theme.colors.profileModal.mainFormLabelColor}>
                Last name
              </FormLabel>
              <Input
                backgroundColor={theme.colors.profileModal.mainFormInputColor}
                borderRadius={10}
                defaultValue={userInfo.lastName}
                onChange={e =>
                  setUserInfo({ ...userInfo, lastName: e.target.value })
                }
              />
            </FormControl>
          </Flex>
          <FormControl m={4} mt={0}>
            <FormLabel color={theme.colors.profileModal.mainFormLabelColor}>
              Email address
            </FormLabel>
            <Input
              backgroundColor={theme.colors.profileModal.mainFormInputColor}
              borderRadius={10}
              defaultValue={userInfo.email}
              onChange={e =>
                setUserInfo({ ...userInfo, email: e.target.value })
              }
            />
          </FormControl>
          <FormControl m={4}>
            <FormLabel color={theme.colors.profileModal.mainFormLabelColor}>
              Account Type
            </FormLabel>
            <Select
              backgroundColor={theme.colors.profileModal.mainFormInputColor}
              borderRadius={10}
              defaultValue={userInfo.type}
              onChange={e => setUserInfo({ ...userInfo, type: e.target.value })}
            >
              <option value="Student">Student</option>
              <option value="Professor">Professor</option>
              <option value="Admin">Admin</option>
              <option value="Developer">Developer</option>
              <option value="Tester">Tester</option>
            </Select>
          </FormControl>
        </Box>
      </Stack>
      <ModalFooter
        paddingInlineEnd={0}
        paddingTop={5}
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
          color={theme.colors.button.text}
          onClick={handleClose}
        >
          Cancel
        </Button>
      </ModalFooter>
    </Box>
  );
};

export default ProfileUserSettings;
