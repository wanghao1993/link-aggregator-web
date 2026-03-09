-- Add type column to verification_codes table for login/registration differentiation
ALTER TABLE verification_codes ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'registration';

-- Update existing rows to have 'registration' type
UPDATE verification_codes SET type = 'registration' WHERE type IS NULL;

-- Add index for type lookups
CREATE INDEX IF NOT EXISTS idx_verification_codes_type ON verification_codes(type);
