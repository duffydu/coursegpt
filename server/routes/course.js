const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams to access schoolId (ie parent route)
const {
  createCourse,
  getSchoolCourse,
  getSchoolCourses,
  improveModel,
  getTrainingStatus,
} = require('../controllers/course');
// const { validateToken } = require('../controllers/auth');

// router.use(validateToken);

router.get('/:courseId', getSchoolCourse);

router.get('/', getSchoolCourses);

router.post('/', createCourse);
router.put('/:courseId/improve-model', improveModel);
router.get('/:courseId/training-status', getTrainingStatus);

module.exports = router;
