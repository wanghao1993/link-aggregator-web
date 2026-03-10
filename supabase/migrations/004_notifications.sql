-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('follow', 'like', 'favorite', 'comment', 'system')),
  title TEXT NOT NULL,
  content TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Enable Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies: users can only read their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (false);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (false);

-- Insert/delete managed by service role only
CREATE POLICY "Notifications service only insert" ON notifications
  FOR INSERT WITH CHECK (false);

CREATE POLICY "Notifications service only delete" ON notifications
  FOR DELETE USING (false);
