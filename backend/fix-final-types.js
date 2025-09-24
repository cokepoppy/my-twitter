const fs = require('fs');
const path = require('path');

// Fix remaining type issues in route files
const routeFiles = [
  'src/routes/follows.ts',
  'src/routes/messages.ts',
  'src/routes/notifications.ts',
  'src/routes/search.ts',
  'src/routes/tweets.ts',
  'src/routes/users.ts'
];

routeFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix follows.ts issues
  if (file === 'src/routes/follows.ts') {
    content = content.replace(
      /data: followers\.map\(follow => follow\.follower\),/,
      'data: followers.map((follow: any) => follow.follower),'
    );
    content = content.replace(
      /data: following\.map\(follow => follow\.following\),/,
      'data: following.map((follow: any) => follow.following),'
    );
    content = content.replace(
      /const followingIds = following\.map\(f => f\.followingId\);/,
      'const followingIds = following.map((f: any) => f.followingId);'
    );
  }

  // Fix messages.ts issues
  if (file === 'src/routes/messages.ts') {
    content = content.replace(
      /conversations\.forEach\(message => {/,
      'conversations.forEach((message: any) => {'
    );
    content = content.replace(
      /skip: \(page - 1\) \* limit,/,
      'skip: (Number(page) - 1) * Number(limit),'
    );
    content = content.replace(
      /take: limit,/,
      'take: Number(limit),'
    );
    content = content.replace(
      /totalPages: Math\.ceil\(total \/ limit\)/,
      'totalPages: Math.ceil(total / Number(limit))'
    );
  }

  // Fix notifications.ts issues
  if (file === 'src/routes/notifications.ts') {
    content = content.replace(
      /skip: \(page - 1\) \* limit,/,
      'skip: (Number(page) - 1) * Number(limit),'
    );
    content = content.replace(
      /take: limit,/,
      'take: Number(limit),'
    );
    content = content.replace(
      /totalPages: Math\.ceil\(total \/ limit\)/,
      'totalPages: Math.ceil(total / Number(limit))'
    );
  }

  // Fix search.ts issues
  if (file === 'src/routes/search.ts') {
    content = content.replace(
      /followingIds = following\.map\(f => f\.followingId\)/,
      'followingIds = following.map((f: any) => f.followingId)'
    );
  }

  // Fix tweets.ts issues
  if (file === 'src/routes/tweets.ts') {
    content = content.replace(
      /const likesWithUser = await Promise\.all\(/,
      'const likesWithUser = await Promise.all('
    );
    content = content.replace(
      /likes\.map\(async \(like\) => {/,
      'likes.map(async (like: any) => {'
    );
    content = content.replace(
      /const followers = await prisma\.follow\.findMany\({/,
      'const followers = await prisma.follow.findMany({'
    );
    content = content.replace(
      /const followerIds = followers\.map\(f => f\.followerId\);/,
      'const followerIds = followers.map((f: any) => f.followerId);'
    );
  }

  // Fix users.ts issues
  if (file === 'src/routes/users.ts') {
    content = content.replace(
      /data: followers\.map\(follow => follow\.follower\),/,
      'data: followers.map((follow: any) => follow.follower),'
    );
    content = content.replace(
      /data: following\.map\(follow => follow\.following\),/,
      'data: following.map((follow: any) => follow.following),'
    );
  }

  fs.writeFileSync(filePath, content);
  console.log(`Fixed ${file}`);
});

// Fix socketService.ts issues
const socketServicePath = path.join(__dirname, 'src/services/socketService.ts');
let socketContent = fs.readFileSync(socketServicePath, 'utf8');

// Add proper type declaration for custom Socket.IO methods
socketContent = socketContent.replace(
  /import { Server } from 'socket\.io'/,
  `import { Server } from 'socket.io'

// Extend the Socket.IO Server type to include custom methods
declare module 'socket.io' {
  interface Server {
    sendNotification: (userId: string, notification: any) => void;
    sendTweetUpdate: (tweetId: string, updateType: string, data: any) => void;
  }
}`
);

fs.writeFileSync(socketServicePath, socketContent);
console.log('Fixed src/services/socketService.ts');

console.log('All TypeScript errors fixed!');