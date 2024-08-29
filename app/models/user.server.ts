import type { Password, User } from "@prisma/client";
import bcrypt from "bcryptjs";
import invariant from "tiny-invariant";

import { prisma } from "~/db.server";

export type { User } from "@prisma/client";

export async function getUserById(id: User["id"]) {
  return prisma.user.findUnique({ where: { id } });
}

export async function getUserByUsername(username: User["username"]) {
  return prisma.user.findUnique({ where: { username } });
}

export async function getUserByEmail(email: User["email"]) {
  return prisma.user.findUnique({ where: { email } });
}

export async function createUser(email: User["email"], username: User["username"],password: string) {
  const hashedPassword = await bcrypt.hash(password, 10);

  return prisma.user.create({
    data: {
      email,
      username,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  });
}

export async function deleteUserByEmail(email: User["email"]) {
  return prisma.user.delete({ where: { email } });
}

export async function verifyLogin(
  userOrEmail: string,
  password: Password["hash"],
) {
  let user;

  if (userOrEmail.includes("@")) {
    user = await getUserByEmail(userOrEmail);
  } else {
    user = await getUserByUsername(userOrEmail);
  }

  if (!user) {
    return undefined;
  }

  const userPassword = await getUserPasswordById(user.id);
  if (!userPassword) {
    return undefined;
  }

  const isValid = await bcrypt.compare(password, userPassword.hash);
  if (!isValid) {
    return undefined;
  }

  return user;
}

async function getUserPasswordById(id: User["id"]) {
  console.log("getUserPasswordById", id);
  const result = await prisma.password.findUnique({
    where: { userId: id },
  });

  if (result) return { hash: result.hash }; 
  return null;
}

export async function updateUser(
  userId: User["id"],
  data: Partial<User>,
) {
  return prisma.user.update({
    where: { id: userId },
    data,
  });
}

export async function getUserTokens(userId: User["id"]) {

const updatedUser = await prisma.user.findUnique({
  where: { id: userId },
  include: { tokens: true }, // Include the tokens relation
});

invariant(updatedUser, "User not found");

return updatedUser.tokens;
}