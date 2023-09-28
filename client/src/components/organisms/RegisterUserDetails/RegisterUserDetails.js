import React, { useEffect, useState } from 'react';
import {
  Box,
  ButtonGroup,
  Button,
  Heading,
  Flex,
  FormControl,
  FormLabel,
  Select,
  SimpleGrid,
  Stack,
  VStack,
  Text,
  useRadioGroup,
  useCheckboxGroup,
  useTheme,
} from '@chakra-ui/react';
import { useDispatch, useSelector } from 'react-redux';
import {
  SingleSelectButtons,
  MultiSelectButtons,
} from '../../atoms/RadioAndCheckboxBtnGroups/SelectionButtonGroup';
import { updateUser } from '../../../redux/userSlice';
import { schoolsWithCoursesSelector } from '../../../redux/selectors/schoolsWithCoursesSelector';
import { userFavouriteCoursesSelector } from '../../../redux/selectors/userFavouriteCoursesSelector';
import { userSchoolWithCoursesSelector } from '../../../redux/selectors/userSchoolWithCoursesSelector';
import { fetchAllSchools } from '../../../redux/schoolsSlice';
import { fetchAllCourses } from '../../../redux/coursesSlice';

export default function RegisterUserDetails() {
  const dispatch = useDispatch();
  const user = useSelector(state => state.user);

  const handleUserSelection = value => {
    setUserInfo({ ...userInfo, type: value });
    dispatch(fetchAllSchools());
    dispatch(fetchAllCourses());
  };

  const schoolsWithCourses = useSelector(schoolsWithCoursesSelector);
  const userFavoriteCourses = useSelector(userFavouriteCoursesSelector);
  const userSchool = useSelector(userSchoolWithCoursesSelector);

  const [userInfo, setUserInfo] = useState({
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    type: user.type,
  });

  const [selectedSchool, setSelectedSchool] = useState(userSchool);
  const [selectedCourses, setSelectedCourses] = useState(userFavoriteCourses);
  const [disableSubmit, setDisableSubmit] = useState(true);

  const handleSchoolChange = e => {
    // reset courses to empty array
    setSelectedSchool(schoolsWithCourses[e.target.value]);
    setSelectedCourses({});
    dispatch(fetchAllCourses());
  };

  const handleCourseChange = userSelectedCourses => {
    let selectedCoursesObj = {};
    for (let courseId of userSelectedCourses) {
      selectedCoursesObj[courseId] = selectedSchool.courses[courseId];
    }
    setSelectedCourses(selectedCoursesObj);
  };

  useEffect(() => {
    setSelectedCourses({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSchool]);

  useEffect(() => {
    if (isEmpty(selectedCourses)) {
      setDisableSubmit(true);
    } else {
      setDisableSubmit(false);
    }
  }, [selectedCourses]);

  const handleSubmit = () => {
    const favourites = Object.keys(selectedCourses);
    const school = selectedSchool._id;
    const userType = userInfo.type;
    const updatedUser = {
      ...userInfo,
      school: school,
      favourites: favourites,
      userType: userType,
    };
    // dispatch(updateUser(updatedUser));
    console.log("before dispatch");
    dispatch(updateUser({userId: user._id, updatedUser: updatedUser}));
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
      return (
        <>
          <FormLabel color={'white'}>Courses</FormLabel>
          <SimpleGrid minChildWidth="120px" spacing="7px">
            <CourseSelectButtons
              courses={selectedSchool.courses}
              selected={selectedCourses}
              handleChange={handleCourseChange}
            />
          </SimpleGrid>
        </>
      );
    }
  };

  const theme = useTheme();

  return (
    <Flex
      minH={'100vh'}
      align={'center'}
      justify={'center'}
      bg={theme.colors.loginAndReg.mainBackground}
    >
      <Stack
        align={'center'}
        spacing={8}
        mx={'auto'}
        w={[300, 400, 500, 600]}
        py={12}
        px={6}
      >
        <Stack>
          <Heading fontSize={'4xl'} color={theme.colors.loginAndReg.text}>
            User Registration
          </Heading>
        </Stack>
        <Box
          rounded={'lg'}
          bg={theme.colors.loginAndReg.boxBackground}
          boxShadow={'lg'}
          p={8}
          w={[300, 400, 500, 600]}
          m="10px auto"
        >
          {!userInfo.type && (
            <Stack spacing={4}>
              <Heading
                fontSize={'xl'}
                py="20px"
                color={theme.colors.loginAndReg.text}
              >
                Welcome to CourseGPT {userInfo.firstName}!
              </Heading>
              <UserTypeSelectButtons
                value={userInfo.type}
                handleChange={value => handleUserSelection(value)}
                theme={theme}
              />
            </Stack>
          )}
          {userInfo.type && (
            <Stack spacing={4}>
              <Heading
                align={'center'}
                fontSize={'xl'}
                color={theme.colors.loginAndReg.text}
              >
                Registering as a {userInfo.type}
              </Heading>
              <Text
                fontSize={'lg'}
                py="10px"
                color={theme.colors.loginAndReg.text}
              >
                Please select your school and courses below:
              </Text>
              <FormControl>
                <FormLabel color={theme.colors.loginAndReg.text}>
                  School
                </FormLabel>
                <Select
                  placeholder="Select a school"
                  value={selectedSchool?._id}
                  onChange={handleSchoolChange}
                  bg={theme.colors.loginAndReg.inputBackground}
                  color={theme.colors.loginAndReg.text}
                  borderColor={theme.colors.loginAndReg.icon}
                  _focus={{ borderColor: theme.colors.loginAndReg.icon }}
                  _hover={{ borderColor: theme.colors.loginAndReg.icon }}
                  _active={{ borderColor: theme.colors.loginAndReg.icon }}
                >
                  {renderSchools()}
                </Select>
              </FormControl>

              <FormControl>{renderCourses()}</FormControl>

              <ButtonGroup mt="5%" w="100%">
                <Flex w="100%" justifyContent="space-between">
                  <Flex>
                    <Button
                      onClick={() => {
                        setUserInfo({ ...userInfo, type: null });
                      }}
                      bg={theme.colors.button.light}
                      color={theme.colors.button.text}
                      _hover={{
                        bg: theme.colors.button.hover,
                        color: theme.colors.button.text,
                      }}
                      w="7rem"
                      mr="5%"
                    >
                      Back
                    </Button>
                  </Flex>
                  <Button
                    w="7rem"
                    bg={theme.colors.buttonCancel.light}
                    color={theme.colors.buttonCancel.text}
                    _hover={{
                      bg: theme.colors.buttonCancel.hover,
                      color: theme.colors.buttonCancel.text,
                    }}
                    isDisabled={disableSubmit}
                    onClick={handleSubmit}
                  >
                    Submit
                  </Button>
                </Flex>
              </ButtonGroup>
            </Stack>
          )}
        </Box>
      </Stack>
    </Flex>
  );
}

function UserTypeSelectButtons({ handleChange }) {
  const options = ['Student', 'Professor'];

  const { getRadioProps } = useRadioGroup({
    defaultValue: null,
    onChange: handleChange,
  });

  return (
    <VStack {...options}>
      {options.map(value => {
        const option = getRadioProps({ value });
        return (
          <SingleSelectButtons key={value} {...option}>
            I'm a {value}
          </SingleSelectButtons>
        );
      })}
    </VStack>
  );
}

function CourseSelectButtons({ courses, selected, handleChange }) {
  const { setValue, getCheckboxProps } = useCheckboxGroup({
    defaultValue: Object.keys(selected),
    onChange: value => {
      handleChange(value);
    },
  });

  useEffect(() => {
    setValue([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courses]);

  return (
    <>
      {Object.keys(courses).map(value => {
        const option = getCheckboxProps({ value });
        return (
          <MultiSelectButtons key={value} {...option}>
            {courses[value].courseCode}
          </MultiSelectButtons>
        );
      })}
    </>
  );
}

// helper function to determine if an object is empty
function isEmpty(obj) {
  for (const prop in obj) {
    if (Object.hasOwn(obj, prop)) {
      return false;
    }
  }

  return true;
}
