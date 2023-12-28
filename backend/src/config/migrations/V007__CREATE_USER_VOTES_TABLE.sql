CREATE TABLE IF NOT EXISTS user_votes(
	id SERIAL PRIMARY KEY,
	user_id INT NOT NULL,
	task_id INT NOT NULL,
	punctuation INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
	UNIQUE (user_id, task_id)
);