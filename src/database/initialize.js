import db from "./db.js";
import { ensureDatabaseSchema } from "./db.js";

export function initializeDatabase() {
    ensureDatabaseSchema();
    console.log("Database initialized.");
}