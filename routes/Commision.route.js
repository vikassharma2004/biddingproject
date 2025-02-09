import express from "express"
import { uploadPaymentProof } from "../controllers/Comission.controller.js"
import { authenticateUser } from "../middleware/isAuthenticated.js"
import { isAuthorizedRoles } from "../middleware/isAuthenticated.js"
const router=express.Router()

router.route("/uploadproof").post(authenticateUser,isAuthorizedRoles("Auctioneer"),uploadPaymentProof)


export default router