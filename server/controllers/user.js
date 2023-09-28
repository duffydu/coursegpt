const User = require('../models/user');

async function updateUser(req, res) {
  const userId = req.params.userId;
  const updates = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
    });
    res.send({ user: updatedUser });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: 'Failed to update user' });
  }
}

module.exports = {
  updateUser,
};
