-- Trigram GIN indexes accelerate partial-match ILIKE/contains searches on
-- name/phone/email (requirement 4.1: search must support partial matches and
-- stay fast as the database grows).
CREATE INDEX "contacts_name_trgm_idx" ON "contacts" USING GIN ("name" gin_trgm_ops);
CREATE INDEX "contacts_phone_trgm_idx" ON "contacts" USING GIN ("phone" gin_trgm_ops);
CREATE INDEX "contacts_email_trgm_idx" ON "contacts" USING GIN ("email" gin_trgm_ops);
