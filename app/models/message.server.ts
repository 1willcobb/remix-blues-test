import type { Message } from "@prisma/client";

import { EventEmitter } from "events";

// Create and export a singleton instance of EventEmitter
export const eventEmitter = new EventEmitter();

import { prisma } from "~/db.server";

import { createNotification } from "~/models/notification.server";

export async function createMessage({
  content,
  userId,
  chatId,
}: {
  content: string;
  userId: string;
  chatId: string;
}) {
  const message = await prisma.message.create({
    data: {
      content,
      userId,
      chatId,
    },
  });

  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
    include: { participants: true },
  });

  if (!chat) throw new Error("Chat not found");

  // Notify all participants except the sender
  const recipients = chat.participants.filter(participant => participant.id !== userId);
  
  await Promise.all(
    recipients.map(recipient =>
      createNotification({
        userId: recipient.id,
        content: `New message from ${message.userId}`,
      })
    )
  );

  // Emit the event using the event emitter
  recipients.forEach(recipient => {
    eventEmitter.emit("newNotification", {
      userId: recipient.id,
      content: `New message from ${message.userId}`,
      chatId,
    });
  });

  return message;
}

export async function getMessagesByChat(chatId: string, page: number = 1, pageSize: number = 10): Promise<Message[]> {
  const skip = (page - 1) * pageSize;

  return await prisma.message.findMany({
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
