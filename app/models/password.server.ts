import invariant from 'tiny-invariant';
import { v4 as uuidv4 } from "uuid";

import { prisma } from "~/db.server";


import bcrypt from 'bcryptjs';
import { getUserById, getUserByEmail } from "./user.server";


export async function requestPasswordReset(email: string) {

  // Check if the user exists
  const userByEmail = await getUserByEmail(email);
  invariant(userByEmail, 'User by email not found');

  console.log('userByEmail', userByEmail);

  const userId = userByEmail.id;

  return createPasswordResetToken(userId);
}

export async function createPasswordResetToken(userId: string) {


  const token = uuidv4(); // Generate a unique token

  const expiration = new Date();
  expiration.setHours(expiration.getHours() + 1); // Token expires in 1 hour

 
  const passwordResetToken = await prisma.passwordResetToken.create({
    data: {
      token: token,
      userId: userId,
      expiration: expiration,
    },
  });
  return passwordResetToken.token;

}

export async function getPasswordResetToken(token: string) {
  const result = await prisma.passwordResetToken.findUnique({
    where: { token },
  });

  if (!result || new Date(result.expiration) < new Date()) {
    throw new Error("Invalid or expired token");
  }

  return result;
}



export async function resetPassword(token: string, newPassword: string) {
  console.log("resetPassword model");
  // Retrieve the reset token from the database using Prisma
  const result = await prisma.passwordResetToken.findUnique({
    where: { token },
  });

  // Check if the token exists and is not expired
  if (!result || new Date(result.expiration) < new Date()) {
    throw new Error("Invalid or expired password reset token");
  }

  const userId = result.userId;
  if (!userId) {
    throw new Error("User ID is missing in the reset token");
  }

  console.log(`Resetting password for user ${userId}`);

  // Hash the new password using bcrypt
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update the user's password in the database using Prisma
  await prisma.user.update({
    where: { id: userId },
    data: {
      password: {
        update: {
          hash: hashedPassword,
        },
      },
    },
  });

  await prisma.password.update({
    where: { userId },
    data: {
      hash: hashedPassword,
    },
  });

  // Delete the reset token from the database using Prisma
  await prisma.passwordResetToken.delete({
    where: { token },
  });

  console.log(`Password updated for user ${userId}`);
}