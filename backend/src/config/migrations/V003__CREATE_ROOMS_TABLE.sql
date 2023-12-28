CREATE TABLE IF NOT EXISTS rooms(
	id SERIAL PRIMARY KEY,
	name VARCHAR(50) NOT NULL CHECK(LENGTH(name) >= 3 AND LENGTH(name) <= 50),
	code VARCHAR(6) NOT NULL UNIQUE CHECK(LENGTH(code) = 6),
    user_id INT NOT NULL,
	host_votes BOOLEAN NOT NULL,
	card_value_type INT NOT NULL CHECK(card_value_type >= 0 AND card_value_type <= 2),
	created_at TIMESTAMP NOT NULL DEFAULT NOW(),
	password BYTEA NULL,
	FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
