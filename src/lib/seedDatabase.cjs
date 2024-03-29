const { Pool } = require('pg');
const sql = require('sql-template-strings');

const conn = new Pool({
	user: process.env.POSTGRES_USER,
	password: process.env.POSTGRES_PASSWORD,
	host: process.env.POSTGRES_HOST,
	port: parseInt(process.env.POSTGRES_PORT) || 5432,
	database: process.env.POSTGRES_DB
});

const query = async (statement) => {
	try {
		return (await conn.query(statement)).rows;
	} catch (error) {
		throw new Error(`\DB error: ${error.message}`);
	}
};

(async () => {
	try {
		let exists = false;
		try {
			exists = (await query(sql`SELECT to_regclass('public.todo') as exists`))[0].exists == 'todo';
		} catch (e) {}
		if (!exists) {
			console.log(new Date().toISOString(), 'Initializing database');
			await query(
				sql`CREATE TABLE todo (id SERIAL PRIMARY KEY, name TEXT NOT NULL, checked BOOLEAN NOT NULL, sort INTEGER, time_update TIMESTAMP WITH TIME ZONE NOT NULL)`
			);
			await query(
				sql`INSERT INTO todo (checked, name, sort, time_update) VALUES (TRUE, 'Bananas', 1, now()), (FALSE, 'Milk', 2, now()), (FALSE, 'Noodles', 3, now())`
			);
		}
	} catch (createError) {
		console.log(new Date().toISOString(), 'Error initializing database', createError);
	}
	process.exit();
})();
