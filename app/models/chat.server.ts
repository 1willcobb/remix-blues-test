import type { Chat } from "@prisma/client";

import { prisma } from "~/db.server";

export async function createChat(participantIds: string[]): Promise<Chat> {
  return prisma.chat.create({
    data: {
      participants: {
        connect: participantIds.map((id) => ({ id })),
      },
    },
    include: {
      participants: true,
      messages: true,
    },
  });
}

export async function getChatById(chatId: string): Promise<Chat | null> {
  return prisma.chat.findUnique({
    where: { id: chatId },
    include: {
      participants: true,
      messages: true,
    },
  });
}

export async function getUserChats(userId: string): Promise<Chat[]> {
  return prisma.chat.findMany({
    where: {
      participants: {
        some: { id: userId },
      },
    },
    include: {
      participants: true,
      messages: true,
    },
  });
}

export async function deleteChat(chatId: string): Promise<Chat> {
  return prisma.chat.delete({
    where: { id: chatId },
    include: {
      participants: true,
      messages: true,
    },
  });
}
