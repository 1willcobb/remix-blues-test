import { prisma } from "~/db.server";
import type { Notification } from "@prisma/client";

// Create a new notification
export async function createNotification({
  userId,
  content,
  link
}: {
  userId: string;
  content: string;
  link?: string;
}): Promise<Notification> {
  try {
    const notification = await prisma.notification.create({
      data: {
        user: { connect: { id: userId } },
        content,
        link,
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
  pageSize = 100,
}: {
  userId: string;
  page?: number;
  pageSize?: number;
}): Promise<Notification[]> {
  const skip = (page - 1) * pageSize;

  return await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    skip,
    take: pageSize,
  });
}

// Mark notifications as read
export async function markNotificationAsRead(notificationId: string): Promise<Notification> {
  return await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
    include: { user: true },
  });
}

// Delete a notification
export async function deleteNotification(notificationId: string): Promise<Notification> {
  return await prisma.notification.delete({
    where: { id: notificationId },
    include: { user: true },
  });
}

// Delete all notifications for a user
export async function deleteAllUserNotifications(userId: string): Promise<void> {
  return await prisma.notification.deleteMany({
    where: { userId },
  });
}