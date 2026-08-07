-- Extend the social platform enum to cover the platforms advertised in the
-- analyst UI (filter pills) and accepted by the import controller.
ALTER TYPE social_platform_enum ADD VALUE IF NOT EXISTS 'reddit';
ALTER TYPE social_platform_enum ADD VALUE IF NOT EXISTS 'youtube';
