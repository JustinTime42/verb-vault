-- VerbVault Initial Schema
-- Creates all tables for the VerbVault platform

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE
-- Extends Supabase auth.users with profile info
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  website TEXT,
  github_username TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 30),
  CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_-]+$')
);

CREATE INDEX profiles_username_idx ON profiles(username);

-- ============================================
-- THEMES TABLE
-- Core table for verb themes/lists
-- ============================================
CREATE TABLE themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  verbs JSONB NOT NULL DEFAULT '[]'::jsonb,
  tags TEXT[] DEFAULT '{}',
  cover_color TEXT DEFAULT 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
  is_published BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  forked_from UUID REFERENCES themes(id) ON DELETE SET NULL,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,

  CONSTRAINT name_length CHECK (char_length(name) >= 1 AND char_length(name) <= 100),
  CONSTRAINT slug_format CHECK (slug ~ '^[a-z0-9-]+$'),
  CONSTRAINT verbs_is_array CHECK (jsonb_typeof(verbs) = 'array')
);

CREATE INDEX themes_author_id_idx ON themes(author_id);
CREATE INDEX themes_slug_idx ON themes(slug);
CREATE INDEX themes_is_published_idx ON themes(is_published);
CREATE INDEX themes_is_featured_idx ON themes(is_featured);
CREATE INDEX themes_created_at_idx ON themes(created_at DESC);
CREATE INDEX themes_download_count_idx ON themes(download_count DESC);
CREATE INDEX themes_tags_idx ON themes USING gin(tags);

-- ============================================
-- THEME VERSIONS TABLE
-- Track edit history for themes
-- ============================================
CREATE TABLE theme_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_id UUID REFERENCES themes(id) ON DELETE CASCADE NOT NULL,
  version INTEGER NOT NULL,
  verbs JSONB NOT NULL,
  changelog TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(theme_id, version)
);

CREATE INDEX theme_versions_theme_id_idx ON theme_versions(theme_id);

-- ============================================
-- LIKES TABLE
-- User likes on themes
-- ============================================
CREATE TABLE likes (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  theme_id UUID REFERENCES themes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, theme_id)
);

CREATE INDEX likes_theme_id_idx ON likes(theme_id);
CREATE INDEX likes_user_id_idx ON likes(user_id);

-- ============================================
-- COMMENTS TABLE
-- Comments on themes (supports replies)
-- ============================================
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_id UUID REFERENCES themes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT content_length CHECK (char_length(content) >= 1 AND char_length(content) <= 2000)
);

CREATE INDEX comments_theme_id_idx ON comments(theme_id);
CREATE INDEX comments_user_id_idx ON comments(user_id);
CREATE INDEX comments_parent_id_idx ON comments(parent_id);
CREATE INDEX comments_created_at_idx ON comments(created_at DESC);

-- ============================================
-- FOLLOWS TABLE
-- User follow relationships
-- ============================================
CREATE TABLE follows (
  follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id),

  CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);

CREATE INDEX follows_follower_id_idx ON follows(follower_id);
CREATE INDEX follows_following_id_idx ON follows(following_id);

-- ============================================
-- COLLECTIONS TABLE
-- User-created collections of themes
-- ============================================
CREATE TABLE collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT name_length CHECK (char_length(name) >= 1 AND char_length(name) <= 100)
);

CREATE INDEX collections_user_id_idx ON collections(user_id);
CREATE INDEX collections_is_public_idx ON collections(is_public);

-- ============================================
-- COLLECTION THEMES TABLE
-- Junction table for collections and themes
-- ============================================
CREATE TABLE collection_themes (
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
  theme_id UUID REFERENCES themes(id) ON DELETE CASCADE,
  position INTEGER DEFAULT 0,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (collection_id, theme_id)
);

CREATE INDEX collection_themes_collection_id_idx ON collection_themes(collection_id);
CREATE INDEX collection_themes_theme_id_idx ON collection_themes(theme_id);

-- ============================================
-- ACTIVITIES TABLE
-- Activity feed events
-- ============================================
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  target_type TEXT,
  target_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_type CHECK (type IN ('publish', 'like', 'follow', 'comment', 'fork', 'download'))
);

CREATE INDEX activities_user_id_idx ON activities(user_id);
CREATE INDEX activities_type_idx ON activities(type);
CREATE INDEX activities_created_at_idx ON activities(created_at DESC);
CREATE INDEX activities_target_idx ON activities(target_type, target_id);

-- ============================================
-- ACHIEVEMENTS TABLE
-- Available achievements
-- ============================================
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  criteria JSONB
);

-- ============================================
-- USER ACHIEVEMENTS TABLE
-- Earned achievements by users
-- ============================================
CREATE TABLE user_achievements (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, achievement_id)
);

CREATE INDEX user_achievements_user_id_idx ON user_achievements(user_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_themes_updated_at
  BEFORE UPDATE ON themes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collections_updated_at
  BEFORE UPDATE ON collections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate slug from name
CREATE OR REPLACE FUNCTION generate_slug(name TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(regexp_replace(regexp_replace(name, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));
END;
$$ LANGUAGE plpgsql;

-- Function to count likes for a theme
CREATE OR REPLACE FUNCTION get_theme_like_count(theme_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM likes WHERE theme_id = theme_uuid);
END;
$$ LANGUAGE plpgsql;

-- Function to count comments for a theme
CREATE OR REPLACE FUNCTION get_theme_comment_count(theme_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM comments WHERE theme_id = theme_uuid);
END;
$$ LANGUAGE plpgsql;

-- Function to get follower count
CREATE OR REPLACE FUNCTION get_follower_count(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM follows WHERE following_id = user_uuid);
END;
$$ LANGUAGE plpgsql;

-- Function to get following count
CREATE OR REPLACE FUNCTION get_following_count(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM follows WHERE follower_id = user_uuid);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE theme_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- THEMES POLICIES
CREATE POLICY "Published themes are viewable by everyone"
  ON themes FOR SELECT
  USING (is_published = true OR author_id = auth.uid());

CREATE POLICY "Users can create themes"
  ON themes FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own themes"
  ON themes FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own themes"
  ON themes FOR DELETE
  USING (auth.uid() = author_id);

-- THEME VERSIONS POLICIES
CREATE POLICY "Theme versions viewable if theme is viewable"
  ON theme_versions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM themes
      WHERE themes.id = theme_versions.theme_id
      AND (themes.is_published = true OR themes.author_id = auth.uid())
    )
  );

CREATE POLICY "Users can create versions for their themes"
  ON theme_versions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM themes
      WHERE themes.id = theme_versions.theme_id
      AND themes.author_id = auth.uid()
    )
  );

-- LIKES POLICIES
CREATE POLICY "Likes are viewable by everyone"
  ON likes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can like themes"
  ON likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own likes"
  ON likes FOR DELETE
  USING (auth.uid() = user_id);

-- COMMENTS POLICIES
CREATE POLICY "Comments are viewable by everyone"
  ON comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON comments FOR DELETE
  USING (auth.uid() = user_id);

-- FOLLOWS POLICIES
CREATE POLICY "Follows are viewable by everyone"
  ON follows FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can follow others"
  ON follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow"
  ON follows FOR DELETE
  USING (auth.uid() = follower_id);

-- COLLECTIONS POLICIES
CREATE POLICY "Public collections are viewable by everyone"
  ON collections FOR SELECT
  USING (is_public = true OR user_id = auth.uid());

CREATE POLICY "Users can create collections"
  ON collections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own collections"
  ON collections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own collections"
  ON collections FOR DELETE
  USING (auth.uid() = user_id);

-- COLLECTION THEMES POLICIES
CREATE POLICY "Collection themes viewable if collection is viewable"
  ON collection_themes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM collections
      WHERE collections.id = collection_themes.collection_id
      AND (collections.is_public = true OR collections.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can add themes to their collections"
  ON collection_themes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM collections
      WHERE collections.id = collection_themes.collection_id
      AND collections.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove themes from their collections"
  ON collection_themes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM collections
      WHERE collections.id = collection_themes.collection_id
      AND collections.user_id = auth.uid()
    )
  );

-- ACTIVITIES POLICIES
CREATE POLICY "Activities are viewable by everyone"
  ON activities FOR SELECT
  USING (true);

CREATE POLICY "System can create activities"
  ON activities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ACHIEVEMENTS POLICIES
CREATE POLICY "Achievements are viewable by everyone"
  ON achievements FOR SELECT
  USING (true);

-- USER ACHIEVEMENTS POLICIES
CREATE POLICY "User achievements are viewable by everyone"
  ON user_achievements FOR SELECT
  USING (true);
