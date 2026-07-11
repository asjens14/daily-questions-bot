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
				category TEXT
			)
		`);
		return;
	}

	const avatarColumn = tableInfo.find((column) => column.name === "avatar");
	const questionTextColumn = tableInfo.find((column) => column.name === "question_text");
	const needsMigration =
		!avatarColumn ||
		avatarColumn.notnull !== 0 ||
		!questionTextColumn ||
		questionTextColumn.type.toUpperCase() !== "TEXT" ||
		questionTextColumn.notnull !== 1;

	if (!needsMigration) {
		return;
	}

	const migrateQuestionsTable = db.transaction(() => {
		db.exec("ALTER TABLE questions RENAME TO questions_legacy");
		db.exec(`
			CREATE TABLE questions (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				avatar TEXT,
				nickname TEXT NOT NULL,
				question_text TEXT NOT NULL,
				weekday TEXT,
				category TEXT
			)
		`);
		db.exec(`
			INSERT INTO questions (id, avatar, nickname, question_text, weekday, category)
			SELECT id, avatar, nickname, COALESCE(CAST(question_text AS TEXT), ''), weekday, category
			FROM questions_legacy
		`);
		db.exec("DROP TABLE questions_legacy");
	});

	migrateQuestionsTable();
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