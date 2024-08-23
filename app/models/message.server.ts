import type { Message } from "@prisma/client";

import { prisma } from "~/db.server";

export async function createMessage({
  content,
  userId,
  chatId,
}: {
  content: string;
  userId: string;
  chatId: string;
}): Promise<Message> {
  return prisma.message.create({
    data: {
      content,
      user: { connect: { id: userId } },
      chat: { connect: { id: chatId } },
    },
    include: {
      user: true,
      chat: true,
    },
  });
}

export async function getMessagesByChat(chatId: string, page: number = 1, pageSize: number = 10): Promise<Message[]> {
  const skip = (page - 1) * pageSize;

  return prisma.message.findMany({
    where: { chatId },
    include: {
      user: true,
      chat: true,
    },
    orderBy: {
      createdAt: "asc",
    },
    skip,
    take: pageSize,
  });
}

export async function deleteMessage(messageId: string): Promise<Message> {
  return prisma.message.delete({
    where: { id: messageId },
    include: {
      user: true,
      chat: true,
    },
  });
}
