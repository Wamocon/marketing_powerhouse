-- Adds audit-safe WhatsApp consent fields for registration verification flow.
ALTER TABLE users
ADD COLUMN IF NOT EXISTS whatsapp_consent BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS whatsapp_consent_at TIMESTAMPTZ;

-- Optional hardening: ensure consent timestamp exists when consent is true.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'users_whatsapp_consent_requires_timestamp'
      AND conrelid = 'users'::regclass
  ) THEN
    ALTER TABLE users
      ADD CONSTRAINT users_whatsapp_consent_requires_timestamp
      CHECK (
        whatsapp_consent = false
        OR whatsapp_consent_at IS NOT NULL
      );
  END IF;
END $$;
