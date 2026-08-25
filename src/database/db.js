import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database(path.join(__dirname, "..", "..", "data.db"));

function ensureQuestionsTable() {
	const tableInfo = db.prepare("PRAGMA table_info(questions)").all();

	if (tableInfo.length === 0) {
		db.exec(`
			CREATE TABLE questions (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				avatar TEXT,
				nickname TEXT NOT NULL,
				question_text TEXT NOT NULL,
				weekday TEXT,
				category TEXT,
				question_type TEXT NOT NULL DEFAULT 'normal',
				poll_options TEXT,
				allow_multiselect INTEGER NOT NULL DEFAULT 0
			)
		`);
		return;
	}

	const hasQuestionType = tableInfo.some((column) => column.name === "question_type");
	const hasPollOptions = tableInfo.some((column) => column.name === "poll_options");
	const hasAllowMultiselect = tableInfo.some((column) => column.name === "allow_multiselect");

	const migrate = db.transaction(() => {
		if (!hasQuestionType) {
			db.exec("ALTER TABLE questions ADD COLUMN question_type TEXT NOT NULL DEFAULT 'normal'");
		}
		if (!hasPollOptions) {
			db.exec("ALTER TABLE questions ADD COLUMN poll_options TEXT");
		}
		if (!hasAllowMultiselect) {
			db.exec("ALTER TABLE questions ADD COLUMN allow_multiselect INTEGER NOT NULL DEFAULT 0");
		}
	});

	migrate();
}

export function ensureDatabaseSchema() {
	ensureQuestionsTable();

	db.exec(`
		CREATE TABLE IF NOT EXISTS settings (
			key TEXT PRIMARY KEY,
			value TEXT NOT NULL
		);
	`);

	db.prepare(`
		INSERT OR IGNORE INTO settings (key, value)
		VALUES ('questionNumber', '0')
	`).run();
}

ensureDatabaseSchema();

export default db;