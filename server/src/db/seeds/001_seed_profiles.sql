-- Test accounts:
-- admin@example.com / Admin123456
-- student@example.com / Student123456

INSERT INTO profiles (email, password_hash, role, name)
VALUES
  (
    'admin@example.com',
    '$2b$10$v5bJePXiOZDurtGapKw6R.xCqxDl4no0PI7963FrM5.pqatomkvdu',
    'admin',
    'Admin'
  ),
  (
    'student@example.com',
    '$2b$10$XC6vaHHG43.SIpBa4Ffv6.nNxhSZt/hNj1huoFy5FvE0pVROcY/W6',
    'student',
    'Student'
  )
ON CONFLICT (email) DO NOTHING;
