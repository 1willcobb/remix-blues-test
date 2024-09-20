import type { Chat } from "@prisma/client";

import { prisma } from "~/db.server";

export async function createChat(participantIds: string[]): Promise<Chat> {
  return await prisma.chat.create({
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
  
  return await prisma.chat.findUnique({
    where: { id: chatId },
    include: {
      participants: true,
      messages: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              profileImage: true,
            },
          },
        },
      },
    },
  });
}

export async function getUserChats(userId: string): Promise<{ chatId: string, participantName: string }[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      chats: {
        include: {
          participants: {
            select: {
              id: true,
              username: true,
              profileImage: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Filter out the provided userId from the participants and only return chatId and other participants' names
  const userChats = user.chats.map(chat => {
    const otherParticipants = chat.participants.filter(participant => participant.id !== userId);

    return otherParticipants.map(participant => ({
      chatId: chat.id,
      participantName: participant.username,
      participantId: participant.id,
      participantImage: participant.profileImage,
    }));
  }).flat(); // Flatten the array in case there are multiple participants in each chat

  return userChats;
}


export async function checkChats(participantIds: string[]): Promise<Chat | null> {
  const chat = await prisma.chat.findFirst({
    where: {
      participants: {
        every: {
          id: { in: participantIds },
        },
      },
    },
    include: {
      participants: true,
      messages: true,
    },
  });

  if (!chat) {
    return null;
  }

  return chat;
}

export async function getChatByParticipants(participantIds: string[], userId: string): Promise<Chat | null> {
  const chat = await prisma.chat.findFirst({
    where: {
      participants: {
        every: {
          id: { in: participantIds },
        },
      },
    },
    include: {
      participants: true,
      messages: true,
    },
  });

  return chat;
}

export async function deleteChat(chatId: string): Promise<Chat> {
  return await prisma.chat.delete({
    where: { id: chatId },
    include: {
      participants: true,
      messages: true,
    },
  });
}
