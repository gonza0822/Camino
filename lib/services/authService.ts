import bcrypt from "bcryptjs";
import { connectMongo } from "@/lib/db/mongodb";
import { User } from "@/lib/db/models/User";
import type { RegisterInput } from "@/lib/validators/auth";

const BCRYPT_ROUNDS = 12;

// Hashes a plain password for storage.
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

// Verifies email/password credentials and returns the user document.
export async function verifyCredentials(email: string, password: string) {
  await connectMongo();
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user?.passwordHash) return null;

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return null;

  return user;
}

// Registers a new user with email and password.
export async function registerUser(input: RegisterInput) {
  await connectMongo();
  const existing = await User.findOne({ email: input.email.toLowerCase() });
  if (existing) {
    throw new Error("EMAIL_IN_USE");
  }

  const passwordHash = await hashPassword(input.password);
  const user = await User.create({
    name: input.name,
    email: input.email.toLowerCase(),
    passwordHash,
  });

  return user;
}

// Returns whether an email already has a password-based account.
export async function hasPasswordAccount(email: string): Promise<boolean> {
  await connectMongo();
  const user = await User.findOne({ email: email.toLowerCase() });
  return Boolean(user?.passwordHash);
}
