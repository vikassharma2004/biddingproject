import express from "express";
import {
  authenticateUser,
  isAuthorizedRoles,
} from "../middleware/isAuthenticated.js";
import {
  deleteAuctionItem,
  deletePaymentProof,
  fetchAllUsers,
  getAllPaymentProofs,
  getPaymentProofDetail,
  monthlyRevenue,
  updateProofStatus,
} from "../controllers/SuperAdmin.Controller.js";

const router = express.Router();

router
  .route("/auctionitem/delete/:id")
  .delete(authenticateUser, isAuthorizedRoles("SuperAdmin"), deleteAuctionItem);

router
  .route("/paymentproof/delete/:id")
  .delete(authenticateUser, isAuthorizedRoles("SuperAdmin"), deletePaymentProof);

router
  .route("/paymentproof/:id")
  .get(authenticateUser, isAuthorizedRoles("SuperAdmin"), getPaymentProofDetail);

router
  .route("/paymentproofs/getall")
  .get(authenticateUser, isAuthorizedRoles("SuperAdmin"), getAllPaymentProofs);

router
  .route("/monthlyincome")
  .get(authenticateUser, isAuthorizedRoles("SuperAdmin"), monthlyRevenue);

router
  .route("/users/getall")
  .get(authenticateUser, isAuthorizedRoles("SuperAdmin"), fetchAllUsers);

router
  .route("/paymentproof/status/update/:id")
  .put(authenticateUser, isAuthorizedRoles("SuperAdmin"), updateProofStatus);
export default router;
