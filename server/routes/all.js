const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams to access schoolId (ie parent route)
const { getAllCourses } = require('../controllers/course');
// const { validateToken } = require('../controllers/auth');
const { searchUserMessages } = require('../controllers/message');

// router.use(validateToken);

router.get('/courses', getAllCourses);
router.get('/messages', searchUserMessages);

module.exports = router;
