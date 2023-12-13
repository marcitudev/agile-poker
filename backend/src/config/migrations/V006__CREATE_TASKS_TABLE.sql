CREATE TABLE IF NOT EXISTS tasks(
	id SERIAL PRIMARY KEY,
	name VARCHAR(50) NOT NULL CHECK(LENGTH(name) >= 3 AND LENGTH(name) <= 50),
	created_at DATE NOT NULL DEFAULT current_date,
	status INT NULL,
	punctuation NUMERIC(3,2) NULL,
	sprint_id INT NOT NULL,
    FOREIGN KEY (sprint_id) REFERENCES sprints(id) ON DELETE CASCADE
);