import express from "express";
import * as followController from "../../controllers/follow.controller";
const follow = express.Router();

follow.post('/follow/:id', followController.follow); // /api/relation/follow/:id
follow.post('/unfollow/:id', followController.unfollow); // /api/relation/unfollow/:id
follow.get('/suggestion', followController.getSuggestionUsers);
follow.get('/following/:id', followController.getFollowingUsers);
follow.get('/followers/:id', followController.getFollowerUsers);

export default follow;