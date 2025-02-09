import cron from "node-cron"
import { Auction } from "../models/Auction.Schema.js"
import { User } from "../models/User.Schema.js"
import { calculateCommission } from "../controllers/Comission.controller.js";
import { Bid } from "../models/Bid.Schema.js";
import { sendEmail } from "../utils/sendEmail.js";

export const endedAuction = ()=>{


cron.schedule("*/1 * * * *", async () => {
    const endedAuctions = await Auction.find({
        endTime: { $lt: now },
        commissionCalculated: false,
      });
      if (endedAuctions.length > 0) {
        for (const auction of endedAuctions) {
            try {
              const commissionAmount = await calculateCommission(auction._id);
              auction.commissionCalculated = true;
              const highestBidder = await Bid.findOne({
                auction: auction._id,
                bidAmount: auction.currentPrice,
              });
              const auctioneer = await User.findById(auction.CreatedBy);
              auctioneer.unpaidCommissionAmount = commissionAmount;
              if (highestBidder) {
                
                auction. HighestBidder = highestBidder.bidder.id;
                await auction.save();
                // the bidder user
                const bidder = await User.findById(highestBidder.bidder.id);

                // Update the bidder's moneySpent and auctionsWon
                
                
                await User.findByIdAndUpdate(
                  bidder._id,
                  {
                    $inc: {
                      moneySpent: highestBidder.bidAmount,
                      auctionsWon: 1,
                    },
                  },
                  { new: true }
                );
                // Update the auctioneer's unpaidCommission
                await User.findByIdAndUpdate(
                  auctioneer._id,
                  {
                    $inc: {
                      unpaidCommissionAmount: commissionAmount,
                    },
                  },
                  { new: true }
                );
                const subject = `Congratulations! You won the auction for ${auction.title}`;
                const message = `Dear ${bidder.username}, \n\nCongratulations! You have won the auction for ${auction.title}. \n\nBefore proceeding for payment contact your auctioneer via your auctioneer email:${auctioneer.email} \n\nPlease complete your payment using one of the following methods:\n\n1. **Bank Transfer**: \n- Account Name: ${auctioneer.paymentMethods.bankTransfer.bankAccountName} \n- Account Number: ${auctioneer.paymentMethods.bankTransfer.bankAccountNumber} \n- Bank: ${auctioneer.paymentMethods.bankTransfer.bankName}\n\n3. **PayPal**:\n- Send payment to: ${auctioneer.paymentMethods.paypal.paypalEmail}\n\n4. **Cash on Delivery (COD)**:\n- If you prefer COD, you must pay 20% of the total amount upfront before delivery.\n- To pay the 20% upfront, use any of the above methods.\n- The remaining 80% will be paid upon delivery.\n- If you want to see the condition of your auction item then send your email on this: ${auctioneer.email}\n\nPlease ensure your payment is completed by [Payment Due Date]. Once we confirm the payment, the item will be shipped to you.\n\nThank you for participating!\n\nBest regards,\n Auction Team`;
                console.log("SENDING EMAIL TO HIGHEST BIDDER");
                sendEmail({ email: bidder.email, subject, message });
                console.log("SUCCESSFULLY EMAIL SEND TO HIGHEST BIDDER");
              } else {
                await auction.save();
              }
            } catch (error) {
              return next(console.error(error || "Some error in ended auction cron"));
            }
          }
        }
      });
      };
