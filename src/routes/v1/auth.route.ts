import express from "express";
import * as authController from "../../controllers/auth.controller";
const user = express.Router();

user.post("/register", authController.register);
user.post("/login", authController.login);

export default user;