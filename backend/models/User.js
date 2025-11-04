import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // optional for OAuth users
  provider: { type: String, enum: ["local", "google", "facebook"], default: "local" },
  providerId: { type: String },
  username: { type: String, unique: true, sparse: true },
  bio: { type: String, default: "" },
  location: { type: String, default: "" },
  avatarUrl: { type: String, default: "" },
});

// hash password (sikority)
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// verifiying password
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);