-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS todo_db;

-- Use the created database
USE todo_db;

-- Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    description VARCHAR(255) NOT NULL,
    completed BOOLEAN DEFAULT FALSE
);

-- Create user if it doesn't already exist
CREATE USER IF NOT EXISTS 'todo_user'@'%' IDENTIFIED BY '{{MYSQL_PASSWORD}}';

-- Grant necessary permissions to the user
GRANT ALL PRIVILEGES ON todo_db.* TO 'todo_user'@'%';

-- Flush privileges to ensure the changes take effect
FLUSH PRIVILEGES;
