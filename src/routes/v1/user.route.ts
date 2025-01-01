import express from "express";
import * as userController from "../../controllers/user.controller";
// import followRoute from "../v1/follow.route";
const user = express.Router();

user.get("/", userController.getAllUsers);
user.get("/current", userController.getCurrentUser);
user.get("/:id", userController.getUserById);
user.patch("/:id", userController.updateUserAlt);
user.delete("/:id", userController.deleteUser);

// user.use('/', followRoute);

export default user;