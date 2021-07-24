const { User } = require("../models/user.model");
const { successResponse, errorResponse } = require("../utils");
const { extend } = require("lodash");

const getAllUser = async (req, res) => {
  try {
    const users = await User.find({}).select(
      "-__v -password -createdAt -updatedAt"
    );

    return successResponse(res, {
      message: "Users retrieved successfully",
      users,
    });
  } catch (error) {
    return errorResponse(res, "Could not retrieve users", error);
  }
};

const deleteAllUser = async (req, res) => {
  try {
    await User.deleteMany({});
    return successResponse(res, { message: "Users deleted successfully" });
  } catch (error) {
    return errorResponse(res, "Could not delete the users", error);
  }
};

const userIdCheck = async (req, res, next, userId) => {
  try {
    const user = await User.findOne({ _id: userId })
      .populate("quizzesTaken.quiz", "name")
      .select("-password -userCreatedQuizzes -__v -createdAt -updatedAt");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    req.userId = userId;
    req.user = user;
    next();
  } catch (error) {
    return errorResponse(res, "Could not retrieve user", error);
  }
};

const getUser = async (req, res) => {
  const { user } = req;
  return successResponse(res, { message: "User retrieved successfully", user });
};

const updateUser = async (req, res) => {
  try {
    const updateData = req.body;

    if (updateData.userCreatedQuiz) {
      await User.findOneAndUpdate({ _id: req.userId });
    }

    let userToBeUpdated = await User.findOne({ _id: req.userId });
    userToBeUpdated = extend(userToBeUpdated, updateData);
    const updatedUser = await userToBeUpdated.save();
    updatedUser.__v = undefined;
    updatedUser.password = undefined;

    return successResponse(res, {
      message: "User updated successfully",
      updatedUser,
    });
  } catch (error) {
    return errorResponse(res, "Could not update the user", error);
  }
};

const deleteUser = async (req, res) => {
  try {
    await User.deleteOne({ _id: req.userId });
    return successResponse(res, {
      message: "User deleted successfully",
    });
  } catch (error) {
    return errorResponse(res, "Could not delete the user", error);
  }
};

module.exports = {
  getAllUser,
  deleteAllUser,
  userIdCheck,
  getUser,
  updateUser,
  deleteUser,
};
