-- Buat database dengan beberapa setup
CREATE DATABASE IF NOT EXISTS kos_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE kos_db;

-- Buat tabel users
CREATE TABLE users (
  id_user       VARCHAR(20)  NOT NULL,   -- PNG-0001 / PML-0001 / ADM-0001
  kode_unik     VARCHAR(20)  NULL,       -- hanya terisi untuk penghuni
  nama          VARCHAR(100) NOT NULL,
  gmail         VARCHAR(100) NOT NULL,
  no_telp       VARCHAR(15)  NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('penghuni', 'pemilik', 'admin') NOT NULL DEFAULT 'penghuni',
  is_active     TINYINT(1)   NULL,

-- Assign primary key dan unique key
  PRIMARY KEY (id_user),
  UNIQUE KEY uq_users_kode_unik (kode_unik),
  UNIQUE KEY uq_users_gmail (gmail),
  UNIQUE KEY uq_users_no_telp (no_telp),

-- Buat constraint
  CONSTRAINT chk_users_gmail
    CHECK (gmail LIKE '%@gmail.com'),
  CONSTRAINT chk_users_no_telp
    CHECK (no_telp REGEXP '^[0-9+]{10,15}$'),
  CONSTRAINT chk_users_id_prefix
    CHECK (
      (role = 'penghuni' AND id_user LIKE 'PNG-%') OR
      (role = 'pemilik'  AND id_user LIKE 'PML-%') OR
      (role = 'admin'    AND id_user LIKE 'ADM-%')
    ),
-- kode_unik: wajib untuk penghuni, dan harus kosong untuk role lain
  CONSTRAINT chk_users_kode_unik
    CHECK (
      (role = 'penghuni' AND kode_unik IS NOT NULL) OR
      (role <> 'penghuni' AND kode_unik IS NULL)
    ),
-- is_active: wajib 0 atau 1 untuk penghuni, kosong untuk role lain
  CONSTRAINT chk_users_is_active
    CHECK (
      (role = 'penghuni' AND is_active IN (0, 1)) OR
      (role <> 'penghuni' AND is_active IS NULL)
    )
);

-- Biar check constraint bisa jalan, perlu jalankan sekali aja
-- SET GLOBAL tidb_enable_check_constraint = ON;

-- Tahap verifikasi database
-- Harus GAGAL: penghuni tanpa kode_unik
INSERT INTO users (id_user, kode_unik, nama, gmail, no_telp, password_hash, role, is_active)
VALUES ('PNG-9001', NULL, 'Uji 1', 'uji1@gmail.com', '081111111111', 'x', 'penghuni', 1);

-- Harus GAGAL: pemilik memakai kode_unik
INSERT INTO users (id_user, kode_unik, nama, gmail, no_telp, password_hash, role, is_active)
VALUES ('PML-9001', 'KOS-X', 'Uji 2', 'uji2@gmail.com', '082222222222', 'x', 'pemilik', NULL);

-- Harus GAGAL: email bukan Gmail
INSERT INTO users (id_user, kode_unik, nama, gmail, no_telp, password_hash, role, is_active)
VALUES ('PNG-9002', 'KOS-Y', 'Uji 3', 'uji3@yahoo.com', '083333333333', 'x', 'penghuni', 1);