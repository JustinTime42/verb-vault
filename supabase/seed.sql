-- VerbVault Seed Data
-- Initial data for achievements and sample themes

-- ============================================
-- ACHIEVEMENTS
-- ============================================
INSERT INTO achievements (name, description, icon, criteria) VALUES
  ('First Theme', 'Publish your first theme', '🎨', '{"type": "theme_count", "count": 1}'),
  ('Trending', 'Theme reaches 100 downloads', '🔥', '{"type": "download_count", "count": 100}'),
  ('Conversationalist', 'Leave 10 comments', '💬', '{"type": "comment_count", "count": 10}'),
  ('Forker', 'Fork 5 themes', '🍴', '{"type": "fork_count", "count": 5}'),
  ('Star Creator', '50 likes on a single theme', '⭐', '{"type": "single_theme_likes", "count": 50}'),
  ('Completionist', 'Create theme with 50+ verbs', '🎯', '{"type": "verb_count", "count": 50}'),
  ('Influencer', 'Reach 100 followers', '👥', '{"type": "follower_count", "count": 100}'),
  ('AI Whisperer', 'Use AI generation 10 times', '🤖', '{"type": "ai_usage", "count": 10}'),
  ('Early Adopter', 'Join during beta', '🌟', '{"type": "early_adopter", "before": "2025-01-01"}'),
  ('Collector', 'Create 5 collections', '📚', '{"type": "collection_count", "count": 5}');
