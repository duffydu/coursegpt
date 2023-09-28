import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  ModalFooter,
  ModalHeader,
  Select,
  SimpleGrid,
  useTheme,
} from '@chakra-ui/react';

import { updateUser } from '../../../../redux/userSlice';
import { schoolsWithCoursesSelector } from '../../../../redux/selectors/schoolsWithCoursesSelector';
import { userFavouriteCoursesSelector } from '../../../../redux/selectors/userFavouriteCoursesSelector';
import { userSchoolWithCoursesSelector } from '../../../../redux/selectors/userSchoolWithCoursesSelector';

import { MultiSelectButtons } from '../../../atoms/RadioAndCheckboxBtnGroups/SelectionButtonGroup';

const ProfileSchoolSettings = ({ handleClose }) => {
  const dispatch = useDispatch();
  const schoolsWithCourses = useSelector(schoolsWithCoursesSelector);
  const userFavoriteCourses = useSelector(userFavouriteCoursesSelector);
  const userSchool = useSelector(userSchoolWithCoursesSelector);
  const user = useSelector(state => state.user);
  const theme = useTheme();

  const [selectedSchool, setSelectedSchool] = useState(userSchool);
  const [selectedCourses, setSelectedCourses] = useState(userFavoriteCourses);

  const handleSchoolChange = e => {
    setSelectedSchool(schoolsWithCourses[e.target.value]);
  };

  useEffect(() => {
    if (selectedSchool && userSchool && selectedSchool._id === userSchool._id) {
      setSelectedCourses(userFavoriteCourses);
    } else {
      setSelectedCourses({});
    }
  }, [selectedSchool]);

  const handleCourseChange = course => {
    setSelectedCourses(prevCourses => {
      if (prevCourses[course._id]) {
        // eslint-disable-next-line no-unused-vars
        const { [course._id]: deletedCourse, ...remainingCourses } =
          prevCourses;
        return remainingCourses;
      } else {
        return { ...prevCourses, [course._id]: course };
      }
    });
  };

  const handleSave = () => {
    const favourites = Object.keys(selectedCourses);
    const school = selectedSchool._id;
    const updatedUser = { school, favourites };
    // dispatch(updateUser(updatedUser));
    dispatch(updateUser({userId: user._id, updatedUser: updatedUser}));
    handleClose();
  };

  const renderSchools = () => {
    return Object.values(schoolsWithCourses).map((school, i) => (
      <option key={i} value={school._id}>
        {school.name}
      </option>
    ));
  };

  const renderCourses = () => {
    if (selectedSchool) {
      return Object.values(selectedSchool.courses).map((course, i) => (
        <MultiSelectButtons
          key={i}
          isChecked={!!selectedCourses[course._id]}
          onChange={() => handleCourseChange(course)}
        >
          {course.courseCode}
        </MultiSelectButtons>
      ));
    }
  };

  return (
    <Box w="600px" color={theme.colors.profileModal.mainTextColor}>
      <ModalHeader>School Settings</ModalHeader>
      <FormControl paddingInlineStart={6}>
        <FormLabel color={theme.colors.profileModal.mainFormLabelColor}>
          School
        </FormLabel>
        <Select
          bg={theme.colors.loginAndReg.inputBackground}
          color={theme.colors.loginAndReg.text}
          borderColor={theme.colors.loginAndReg.icon}
          _focus={{ borderColor: theme.colors.loginAndReg.icon }}
          _hover={{ borderColor: theme.colors.loginAndReg.icon }}
          _active={{ borderColor: theme.colors.loginAndReg.icon }}
          placeholder="Select a school"
          value={selectedSchool?._id}
          onChange={handleSchoolChange}
          margin={3}
        >
          {renderSchools()}
        </Select>
        <FormLabel color={theme.colors.profileModal.mainFormLabelColor}>
          Courses
        </FormLabel>
        <SimpleGrid minChildWidth="120px" spacing="7px">
          {renderCourses()}
        </SimpleGrid>
      </FormControl>
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
          color={theme.colors.buttonCancel.text}
          onClick={handleClose}
        >
          Cancel
        </Button>
      </ModalFooter>
    </Box>
  );
};

export default ProfileSchoolSettings;
