const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams to access schoolId (ie parent route)

const {
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
} = require('../controllers/course');

router.get('/:courseId', getCourse);

router.post('/', createCourse);

router.put('/:courseId', updateCourse);

router.delete('/:courseId', deleteCourse);

module.exports = router;
