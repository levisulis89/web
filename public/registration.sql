-- 1. Létrehozzuk a users táblát
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password CHAR(40) NOT NULL -- SHA1 hash 40 karakter hosszú
);

