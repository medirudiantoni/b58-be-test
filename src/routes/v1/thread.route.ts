import express from "express";
import * as threadController from "../../controllers/thread.controller";
import { authentication } from "../../middlewares/authentication";
const thread = express.Router();

thread.post("/", authentication, threadController.createNewThread);
thread.get("/", threadController.getAllThreads);
thread.get("/:id", threadController.getThreadById);
thread.patch("/:id", authentication, threadController.updateThread);
thread.delete("/:id", authentication, threadController.deleteThreadById);

thread.get("/user/:userId", threadController.getThreadByUserId);

export default thread;