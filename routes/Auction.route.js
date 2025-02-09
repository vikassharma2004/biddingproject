import express from "express"
import {  createAuction, DeleteAuction, GetAllItems, GetAucctionDetails, getMyAuctions, RepublishAuction } from "../controllers/AuctionItem.controller.js"
import {authenticateUser, isAuthorizedRoles} from "../middleware/isAuthenticated.js"
import {trackCommissionStatus} from "../middleware/trackcommision.js"
const router=express.Router()


router.route("/create").post(authenticateUser,trackCommissionStatus,createAuction)
router.route("/allitems").get(GetAllItems)
router.route("/:id").get(GetAucctionDetails)
router.route("/myitems").get(authenticateUser,isAuthorizedRoles("Auctioneer"),getMyAuctions)
router.route("/delete/:id").delete(authenticateUser,isAuthorizedRoles("Auctioneer"),DeleteAuction)
router.route("/item/republish/:id").put(authenticateUser,isAuthorizedRoles("Auctioneer"),RepublishAuction)



export default router 