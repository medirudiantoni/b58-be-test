import express from "express";
import * as likeController from "../../controllers/like.controller";
const like = express.Router();

like.post('/', likeController.createLike);
like.delete('/', likeController.deleteLike);

export default like;