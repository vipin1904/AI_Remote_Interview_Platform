import { requireAuth, clerkClient } from "@clerk/express";
import User from "../models/User.js";
import { upsertStreamUser } from "../lib/stream.js";

export const protectRoute = [
  requireAuth(),
  async (req, res, next) => {
    try {
      const clerkId = req.auth().userId;

      if (!clerkId) return res.status(401).json({ message: "Unauthorized - invalid token" });

      // find user in db by clerk ID
      let user = await User.findOne({ clerkId });

      if (!user) {
        // Auto-sync user from Clerk if webhook didn't run (e.g. in local development)
        try {
          const clerkUser = await clerkClient.users.getUser(clerkId);
          if (clerkUser) {
            const email = clerkUser.emailAddresses?.[0]?.emailAddress || "";
            const name =
              `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() ||
              email.split("@")[0] ||
              "User";
            const profileImage = clerkUser.imageUrl || "";

            user = await User.findOneAndUpdate(
              { clerkId },
              { clerkId, email, name, profileImage },
              { upsert: true, new: true }
            );

            await upsertStreamUser({
              id: clerkId,
              name: user.name,
              image: user.profileImage,
            });
          }
        } catch (syncError) {
          console.error("Error auto-syncing Clerk user to MongoDB:", syncError);
        }
      }

      if (!user) return res.status(404).json({ message: "User not found" });

      // attach user to req
      req.user = user;

      next();
    } catch (error) {
      console.error("Error in protectRoute middleware", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },
];
