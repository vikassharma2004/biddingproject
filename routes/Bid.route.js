import express from "express"
import { PlaceBid } from "../controllers/Bid.controller.js"
import { authenticateUser } from "../middleware/isAuthenticated.js"
import { isAuthorizedRoles } from "../middleware/isAuthenticated.js"
import { checkAuctionEndTime } from "../middleware/checkAuctionEndTime.js"
const router = express.Router()

router.route("/placebid/:id").post(authenticateUser,isAuthorizedRoles("Bidder"),checkAuctionEndTime,PlaceBid)



export default router