import express from "express";
import * as replyController from "../../controllers/reply.controller";
const reply = express.Router();

reply.post("/", replyController.createReply);
reply.get("/", replyController.getAllReply);
reply.get("/:id", replyController.getReplyById); // /api/reply/:id
reply.delete("/:id", replyController.deleteReply);

export default reply;