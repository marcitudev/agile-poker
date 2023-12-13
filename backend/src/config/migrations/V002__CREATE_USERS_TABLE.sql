CREATE TABLE IF NOT EXISTS users(
	id SERIAL PRIMARY KEY,
	username VARCHAR(30) NOT NULL UNIQUE CHECK(LENGTH(username) >= 3 AND LENGTH(username) <= 30),
	first_name VARCHAR(30) NOT NULL CHECK(LENGTH(first_name) >= 3 AND LENGTH(first_name) <= 30),
	last_name VARCHAR(30) NOT NULL CHECK(LENGTH(last_name) >= 3 AND LENGTH(last_name) <= 30),
	password BYTEA NOT NULL
);