const Course = require('../models/course');
const School = require('../models/school');
const { createEmbeddingForNewData } = require('../gpt/createEmbeddings');

async function getSchoolCourse(req, res) {
  try {
    const courseId = req.params.courseId;
    const course = await Course.findById(courseId);

    res.status(200).json({ course });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
}

async function getSchoolCourses(req, res) {
  try {
    const schoolId = req.params.schoolId;
    const courses = await Course.find({ school: schoolId });

    res.status(200).json({ courses });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
}

async function getAllCourses(req, res) {
  try {
    const courses = await Course.find({});

    res.status(200).json({ courses });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
}

async function createCourse(req, res) {
  try {
    const schoolId = req.params.schoolId;
    const newCourse = new Course({
      courseName: req.body.courseName || req.body.courseCode,
      courseCode: req.body.courseCode,
      department:
        req.body.department || req.body.courseCode.match(/^[a-zA-Z]+/)[0],
      school: schoolId,
      promptTemplates: req.body.promptTemplates || [],
    });

    const savedCourse = await newCourse.save();
    const school = await School.findById(schoolId);
    school.courses.push(savedCourse);
    await school.save();

    res.status(200).json({ course: savedCourse });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
}

let trainingStatuses = {};

async function improveModel(req, res) {
  try {
    // const submitterId = req.user.id;
    const submitterId = req.params.userId;
    const courseId = req.params.courseId;
    const key = `${courseId}-${submitterId}`;
    if (
      trainingStatuses[key] &&
      trainingStatuses[key].status === 'in-progress'
    ) {
      return res.status(400).json({
        error: 'Request already in progress for this user and course.',
      });
    }

    const course = await Course.findById(courseId).populate('school');

    trainingStatuses[key] = { status: 'in-progress' };

    createEmbeddingForNewData(submitterId, course, req.body.content)
      .then(() => {
        trainingStatuses[key].status = 'complete';
      })
      .catch(error => {
        console.log(error);
        trainingStatuses[key].status = 'failed';
        trainingStatuses[key].message = error.message;
      });

    res.status(202).json(trainingStatuses[key]);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message + error.stack });
  }
}

async function getTrainingStatus(req, res) {
  // const submitterId = req.user.id;
  const submitterId = req.params.userId;
  const courseId = req.params.courseId;
  const key = `${courseId}-${submitterId}`;
  const responseStatus = trainingStatuses[key] || { status: 'not-started' };

  if (responseStatus.status === 'failed') {
    res.status(500).json({ error: responseStatus.message });
  } else {
    delete responseStatus.message;
    res.status(200).json(responseStatus);
  }
}

module.exports = {
  getSchoolCourse,
  getSchoolCourses,
  getAllCourses,
  createCourse,
  improveModel,
  getTrainingStatus,
};
