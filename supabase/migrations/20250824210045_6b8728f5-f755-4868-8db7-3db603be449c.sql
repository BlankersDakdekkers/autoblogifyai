-- Fix security warnings for production readiness

-- Enable stronger password security and leaked password protection
-- Update auth configuration for better security
UPDATE auth.config 
SET 
  password_min_length = 8,
  password_require_uppercase = true,
  password_require_lowercase = true, 
  password_require_numbers = true,
  password_require_symbols = true,
  password_leaked_prevention = true
WHERE true;

-- Set appropriate OTP expiry times (1 hour = 3600 seconds)
UPDATE auth.config 
SET 
  otp_expiry_duration = 3600,
  otp_length = 6
WHERE true;

-- Enable additional security settings
UPDATE auth.config
SET
  security_update_password_require_reauthentication = true,
  signup_requires_email_verification = true
WHERE true;