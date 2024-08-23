

import { v4 as uuidv4 } from "uuid";

import { prisma } from "~/db.server";

export async function createPasswordResetToken(userId: string) {
  const token = uuidv4(); // Generate a unique token

  const expiration = new Date();
  expiration.setHours(expiration.getHours() + 1); // Token expires in 1 hour

  await prisma.passwordResetToken.create({
    data: {
      token: token,
      userId: userId,
      expiration: expiration,
    },
  });

  return token;
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



export async function resetPassword(token: string, password: string) {
  const result = await prisma.passwordResetToken.findUnique({
    where: { token },
  });

  if (!result || new Date(result.expiration) < new Date()) {
    throw new Error("Invalid or expired token");
  }

  await prisma.user.update({
    where: { id: result.userId },
    data: {
      password,
    },
  });

  await prisma.passwordResetToken.delete({
    where: { token },
  });
}

export async function deletePasswordResetToken(token: string) {
  await prisma.passwordResetToken.delete({
    where: { token },
  });
}
