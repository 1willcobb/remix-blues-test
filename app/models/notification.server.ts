import { prisma } from "~/db.server";
import type { Notification } from "@prisma/client";

// Create a new notification
export async function createNotification({
  userId,
  content,
}: {
  userId: string;
  content: string;
}): Promise<Notification> {
  try {
    const notification = await prisma.notification.create({
      data: {
        user: { connect: { id: userId } },
        content,
      },
      include: { user: true },
    });
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw new Error("Failed to create notification.");
  }
}

// Retrieve notifications for a user (with pagination support)
export async function getNotificationsByUser({
  userId,
  page = 1,
  pageSize = 10,
}: {
  userId: string;
  page?: number;
  pageSize?: number;
}): Promise<Notification[]> {
  const skip = (page - 1) * pageSize;

  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    skip,
    take: pageSize,
  });
}

// Mark notifications as read
export async function markNotificationAsRead(notificationId: string): Promise<Notification> {
  return prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
    include: { user: true },
  });
}

// Delete a notification
export async function deleteNotification(notificationId: string): Promise<Notification> {
  return prisma.notification.delete({
    where: { id: notificationId },
    include: { user: true },
  });
}
