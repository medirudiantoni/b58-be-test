"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_route_1 = __importDefault(require("./v1/user.route"));
const follow_route_1 = __importDefault(require("./v1/follow.route"));
const auth_route_1 = __importDefault(require("./v1/auth.route"));
const thread_route_1 = __importDefault(require("./v1/thread.route"));
const reply_route_1 = __importDefault(require("./v1/reply.route"));
const authentication_1 = require("../middlewares/authentication");
const user_controller_1 = require("../controllers/user.controller");
const like_controller_1 = require("../controllers/like.controller");
const thread_controller_1 = require("../controllers/thread.controller");
const router = express_1.default.Router();
router.use('/auth', auth_route_1.default);
router.use('/user/:id', user_controller_1.getUserById);
router.use('/users', authentication_1.authentication, user_route_1.default);
router.use('/relation', authentication_1.authentication, follow_route_1.default); // /api/relation
router.use('/thread', authentication_1.authentication, thread_route_1.default);
router.use('/reply', authentication_1.authentication, reply_route_1.default);
router.use('/like', authentication_1.authentication, like_controller_1.createLike);
router.use('/unlike', authentication_1.authentication, like_controller_1.deleteLike);
router.get('/threads', thread_controller_1.getAllThreads);
exports.default = router;
