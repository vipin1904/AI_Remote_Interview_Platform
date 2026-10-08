import User from "../models/User.js";

export async function getMe(req, res) {
  try {
    const user = req.user;
    res.status(200).json({ user });
  } catch (error) {
    console.error("Error in getMe controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function updateRole(req, res) {
  try {
    const { role } = req.body;

    if (!["interviewer", "candidate"].includes(role)) {
      return res.status(400).json({ message: "Invalid role. Must be 'interviewer' or 'candidate'" });
    }

    req.user.role = role;
    await req.user.save();

    res.status(200).json({ user: req.user, message: `Role updated to ${role}` });
  } catch (error) {
    console.error("Error in updateRole controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
