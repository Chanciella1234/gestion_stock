const Notification = require('../models/Notification');
const { success, error } = require('../utils/apiResponse');

exports.liste = async (req, res, next) => {
  try {
    const { lue } = req.query;
    const filter = { utilisateur: req.user._id };
    if (lue === 'false') filter.lu = false;
    else if (lue === 'true') filter.lu = true;

    const notifications = await Notification.find(filter)
      .sort('-createdAt');
    success(res, notifications);
  } catch (err) {
    next(err);
  }
};

exports.marquerLue = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, utilisateur: req.user._id },
      { lu: true },
      { new: true }
    );

    if (!notification) {
      return error(res, 'Notification non trouvée.', 404);
    }

    success(res, notification, 'Notification marquée comme lue');
  } catch (err) {
    next(err);
  }
};

exports.marquerToutLue = async (req, res, next) => {
  try {
    const result = await Notification.updateMany(
      { utilisateur: req.user._id, lu: false },
      { lu: true }
    );
    success(res, { modifies: result.modifiedCount }, 'Toutes les notifications marquées comme lues');
  } catch (err) {
    next(err);
  }
};
