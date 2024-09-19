import type { Message } from "@prisma/client";
import { prisma } from "~/db.server";

import { createNotification } from "~/models/notification.server";
import { getUserById } from "./user.server";

import { io } from "../../server";

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
    include: { participants: true,
      
    },
  });

  if (!chat) throw new Error("Chat not found");

  console.log("Message created:", message);

  const user = await getUserById(userId);

  if (!user) throw new Error("User not found");

  const formattedMessage = {
    ...message,
    user: {
      id: user.id,
      username: user.username,
      profileImage: user.profileImage,
    },
  };

  // Notify all participants except the sender
  const recipients = chat.participants.filter(participant => participant.id !== userId);
  
  await Promise.all(
    recipients.map(recipient =>
      createNotification({
        userId: recipient.id,
        content: `New message from ${user.username} stating: ${content}`,
      })
    )
  );


  // // Emit the event using the event emitter
  // recipients.forEach(recipient => {
  //   console.log("***Emitting message to user: ", recipient.id);
  //   io.emit("note", {
  //     userId: recipient.id,
  //     content: `New message from ${user.username} stating: ${content}`,
  //     chatId,
  //   });
  //   console.log("!!!!after emit", chatId);
  // });



  return formattedMessage;
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
