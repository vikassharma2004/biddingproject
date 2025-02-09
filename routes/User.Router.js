import express from "express"
const router = express.Router()

import { registerUser,loginUser,logout,GetProfile,getLeaderBoard } from "../controllers/User.Controller.js"

import{ authenticateUser }from "../middleware/isAuthenticated.js"

router.route("/register").post(registerUser)
router.route("/login").post(loginUser)
router.route("/leaderboard").get(getLeaderBoard)
router.route("/logout").post(authenticateUser,logout)
router.route("/profile").get(authenticateUser,GetProfile)



export default router