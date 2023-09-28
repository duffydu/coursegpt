const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams to access schoolId (ie parent route)
const {
  getFeedback,
  // createFeedback,
  updateFeedback,
  deleteFeedback,
} = require('../controllers/feedback');
// const { validateToken } = require('../controllers/auth');

// router.use(validateToken);

router.get('/:feedbackId', getFeedback);

// router.post('/', createFeedback);

router.put('/:feedbackId', updateFeedback);

router.delete('/:feedbackId', deleteFeedback);

module.exports = router;
