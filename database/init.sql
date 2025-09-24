-- Twitter Clone Database Initialization Script
-- This script sets up the initial database structure

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS twitter CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Use the database
USE twitter;

-- Create user if not exists
CREATE USER IF NOT EXISTS 'twitter_user'@'%' IDENTIFIED BY 'twitter_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON twitter.* TO 'twitter_user'@'%';

-- Flush privileges
FLUSH PRIVILEGES;

-- Create additional indexes for performance
-- These will be created by Prisma migrations, but we can add some additional ones here

-- Index for tweet content search (if using full-text search)
-- ALTER TABLE tweets ADD FULLTEXT INDEX idx_tweets_content (content);

-- Index for user search
-- ALTER TABLE users ADD FULLTEXT INDEX idx_users_search (username, fullName, bio);

-- Index for tweet timeline performance
-- CREATE INDEX idx_tweets_user_created ON tweets (userId, createdAt DESC);

-- Index for follow relationships
-- CREATE INDEX idx_follows_follower ON follows (followerId);
-- CREATE INDEX idx_follows_following ON follows (followingId);

-- Create view for active users
-- CREATE VIEW active_users AS
-- SELECT u.*, COUNT(t.id) as recent_tweets_count
-- FROM users u
-- LEFT JOIN tweets t ON u.id = t.userId AND t.createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)
-- GROUP BY u.id
-- HAVING u.updatedAt >= DATE_SUB(NOW(), INTERVAL 30 DAY);

-- Create view for trending tweets
-- CREATE VIEW trending_tweets AS
-- SELECT t.*,
--        COUNT(l.id) as total_likes,
--        COUNT(r.id) as total_retweets,
--        COUNT(rep.id) as total_replies
-- FROM tweets t
-- LEFT JOIN likes l ON t.id = l.tweetId
-- LEFT JOIN tweets r ON t.id = r.retweetId AND r.isDeleted = false
-- LEFT JOIN tweets rep ON t.id = rep.replyToTweetId AND rep.isDeleted = false
-- WHERE t.isDeleted = false
--   AND t.createdAt >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
-- GROUP BY t.id
-- ORDER BY (COUNT(l.id) + COUNT(r.id) + COUNT(rep.id)) DESC;

-- Create view for user statistics
-- CREATE VIEW user_statistics AS
-- SELECT
--     u.id,
--     u.username,
--     u.fullName,
--     u.followersCount,
--     u.followingCount,
--     u.tweetsCount,
--     COUNT(DISTINCT f.id) as actual_followers,
--     COUNT(DISTINCT f2.id) as actual_following,
--     COUNT(DISTINCT t.id) as actual_tweets,
--     COUNT(DISTINCT l.id) as total_likes_received,
--     COUNT(DISTINCT t2.id) as total_retweets_received
-- FROM users u
-- LEFT JOIN follows f ON u.id = f.followingId
-- LEFT JOIN follows f2 ON u.id = f2.followerId
-- LEFT JOIN tweets t ON u.id = t.userId AND t.isDeleted = false
-- LEFT JOIN likes l ON u.id = l.userId
-- LEFT JOIN tweets t2 ON t2.retweetId IN (SELECT id FROM tweets WHERE userId = u.id) AND t2.isDeleted = false
-- GROUP BY u.id;

-- Create stored procedure for cleaning up old notifications
-- DELIMITER //
-- CREATE PROCEDURE CleanOldNotifications(IN days_to_keep INT)
-- BEGIN
--     DELETE FROM notifications
--     WHERE createdAt < DATE_SUB(NOW(), INTERVAL days_to_keep DAY)
--     AND isRead = true;
-- END //
-- DELIMITER ;

-- Create stored procedure for updating user statistics
-- DELIMITER //
-- CREATE PROCEDURE UpdateUserStatistics(IN user_id VARCHAR(255))
-- BEGIN
--     UPDATE users u SET
--         u.followersCount = (
--             SELECT COUNT(*)
--             FROM follows f
--             WHERE f.followingId = user_id
--         ),
--         u.followingCount = (
--             SELECT COUNT(*)
--             FROM follows f
--             WHERE f.followerId = user_id
--         ),
--         u.tweetsCount = (
--             SELECT COUNT(*)
--             FROM tweets t
--             WHERE t.userId = user_id AND t.isDeleted = false
--         )
--     WHERE u.id = user_id;
-- END //
-- DELIMITER ;

-- Create trigger to maintain user statistics
-- DELIMITER //
-- CREATE TRIGGER after_follow_insert
-- AFTER INSERT ON follows
-- FOR EACH ROW
-- BEGIN
--     CALL UpdateUserStatistics(NEW.followingId);
--     CALL UpdateUserStatistics(NEW.followerId);
-- END //
-- DELIMITER ;

-- DELIMITER //
-- CREATE TRIGGER after_follow_delete
-- AFTER DELETE ON follows
-- FOR EACH ROW
-- BEGIN
--     CALL UpdateUserStatistics(OLD.followingId);
--     CALL UpdateUserStatistics(OLD.followerId);
-- END //
-- DELIMITER ;

-- DELIMITER //
-- CREATE TRIGGER after_tweet_insert
-- AFTER INSERT ON tweets
-- FOR EACH ROW
-- BEGIN
--     IF NEW.isDeleted = false THEN
--         CALL UpdateUserStatistics(NEW.userId);
--     END IF;
-- END //
-- DELIMITER ;

-- DELIMITER //
-- CREATE TRIGGER after_tweet_update
-- AFTER UPDATE ON tweets
-- FOR EACH ROW
-- BEGIN
--     IF OLD.isDeleted != NEW.isDeleted THEN
--         CALL UpdateUserStatistics(NEW.userId);
--     END IF;
-- END //
-- DELIMITER ;

-- Create event for scheduled cleanup
-- SET GLOBAL event_scheduler = ON;
-- CREATE EVENT IF NOT EXISTS cleanup_old_notifications
-- ON SCHEDULE EVERY 1 DAY
-- STARTS CURRENT_TIMESTAMP + INTERVAL 1 HOUR
-- DO
--     CALL CleanOldNotifications(90);

-- Create event for updating statistics
-- CREATE EVENT IF NOT EXISTS update_user_statistics_daily
-- ON SCHEDULE EVERY 1 DAY
-- STARTS CURRENT_TIMESTAMP + INTERVAL 2 HOUR
-- DO
--     CALL UpdateUserStatistics(NULL);

-- Insert initial admin user (password should be changed immediately)
-- This is optional and can be removed
-- INSERT INTO users (id, username, email, passwordHash, fullName, isVerified, createdAt, updatedAt)
-- VALUES (
--     UUID(),
--     'admin',
--     'admin@twitter-clone.local',
--     '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
--     'System Administrator',
--     true,
--     NOW(),
--     NOW()
-- );

-- Show completion message
SELECT 'Database initialization completed successfully!' as message;