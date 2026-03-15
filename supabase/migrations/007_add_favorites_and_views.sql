-- Favorites table for collections
CREATE TABLE IF NOT EXISTS collection_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, collection_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_collection_favorites_user_id ON collection_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_collection_favorites_collection_id ON collection_favorites(collection_id);

-- Enable Row Level Security
ALTER TABLE collection_favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own favorites" ON collection_favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites" ON collection_favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites" ON collection_favorites
  FOR DELETE USING (auth.uid() = user_id);

-- View counts table (to track daily views)
CREATE TABLE IF NOT EXISTS collection_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_collection_views_collection_id ON collection_views(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_views_date ON collection_views(collection_id, viewed_at DESC);

-- Enable Row Level Security
ALTER TABLE collection_views ENABLE ROW LEVEL SECURITY;

-- RLS Policies - views are public for reading
CREATE POLICY "Collection views are viewable by everyone" ON collection_views
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert collection views" ON collection_views
  FOR INSERT WITH CHECK (true);
