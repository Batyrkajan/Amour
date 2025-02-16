ALTER TABLE messages ADD COLUMN IF NOT EXISTS status text DEFAULT 'sent' CHECK (status IN ('sending', 'sent', 'delivered', 'read', 'error'));
ALTER TABLE messages ADD COLUMN IF NOT EXISTS read_at timestamp with time zone;

-- Add RLS policies for the new columns
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Allow users to update status and read_at for messages they're involved with
CREATE POLICY "Users can update message status and read_at" ON messages
FOR UPDATE USING (
    auth.uid() IN (sender_id, receiver_id)
)
WITH CHECK (
    auth.uid() IN (sender_id, receiver_id)
);