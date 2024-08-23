import { describe, it, expect, beforeAll, afterAll } from 'vitest';

import { prisma } from '~/db.server';
import {
  createPost,
  getUserPosts,
  getUserFeed,
  updatePost,
  deletePost,
  getPostById,
} from '~/models/post.server';

describe('Post CRUD Operations', () => {
  let userId: string;
  let postId: string;

  beforeAll(async () => {
    const uniqueUsername = `testuser_${Date.now()}`;
    console.log('Creating user...');
    const user = await prisma.user.create({
      data: {
        username: uniqueUsername,
        email: `${uniqueUsername}@example.com`,
        password: {
          create: {
            hash: 'hashedpassword',
          },
        },
      },
    });
    userId = user.id;
    console.log(`User created with ID: ${userId}`);
  });

  it('should create a post', async () => {
    console.log('Creating a post...');
    const post = await createPost({
      content: 'This is a test post',
      imageUrl: 'http://example.com/image.jpg',
      userId,
    });

    expect(post.content).toBe('This is a test post');
    expect(post.imageUrl).toBe('http://example.com/image.jpg');
    expect(post.userId).toBe(userId);
    postId = post.id;
    console.log(`Post created with ID: ${postId}`);
  });

  it('should get a post by ID', async () => {
    console.log(`Fetching post with ID: ${postId}...`);
    const post = await getPostById(postId);

    expect(post).not.toBeNull();
    expect(post?.id).toBe(postId);
    expect(post?.content).toBe('This is a test post');
    console.log(`Post fetched: ${JSON.stringify(post)}`);
  });

  it('should update a post', async () => {
    console.log(`Updating post with ID: ${postId}...`);
    const updatedPost = await updatePost({
      postId,
      content: 'Updated content',
      imageUrl: 'http://example.com/updated-image.jpg',
    });

    expect(updatedPost.content).toBe('Updated content');
    expect(updatedPost.imageUrl).toBe('http://example.com/updated-image.jpg');
    console.log(`Post updated: ${JSON.stringify(updatedPost)}`);
  });

  it('should delete a post', async () => {
    console.log(`Deleting post with ID: ${postId}...`);
    const deletedPost = await deletePost(postId);
    expect(deletedPost.id).toBe(postId);

    const postAfterDelete = await getPostById(postId);
    expect(postAfterDelete).toBeNull();
    console.log(`Post deleted. Verification that post is null: ${postAfterDelete}`);
  });

  it('should get user feed with pagination', async () => {
    console.log('Creating posts for user feed...');
    await createPost({ content: 'Feed Post 1', userId });
    await createPost({ content: 'Feed Post 2', userId });
    await createPost({ content: 'Feed Post 3', userId });

    console.log('Setting up user follow relationship...');
    await prisma.userFollow.create({
      data: {
        followerId: userId,
        followedId: userId,
      },
    });

    console.log('Fetching first page of user feed...');
    const feedPage1 = await getUserFeed(userId, 1, 2);
    expect(feedPage1).toHaveLength(2);
    console.log(`First page of feed: ${JSON.stringify(feedPage1)}`);

    console.log('Fetching second page of user feed...');
    const feedPage2 = await getUserFeed(userId, 2, 2);
    expect(feedPage2).toHaveLength(1);
    console.log(`Second page of feed: ${JSON.stringify(feedPage2)}`);
  });

  afterAll(async () => {
    console.log('Cleaning up: Deleting all records...');
    await prisma.vote.deleteMany({});
    console.log('Deleted all votes.');
    await prisma.like.deleteMany({});
    console.log('Deleted all likes.');
    await prisma.comment.deleteMany({});
    console.log('Deleted all comments.');
    await prisma.userFollow.deleteMany({});
    console.log('Deleted all user follow relationships.');
    await prisma.blog.deleteMany({});
    console.log('Deleted all blogs.');
    await prisma.post.deleteMany({});
    console.log('Deleted all posts.');
    await prisma.user.deleteMany({});
    console.log('Deleted all users.');
  });
});
