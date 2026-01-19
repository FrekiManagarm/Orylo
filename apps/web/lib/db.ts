import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "@orylo/database";

/**
 * Database Connection - Neon Serverless PostgreSQL
 * 
 * Uses Drizzle ORM with Neon HTTP driver
 * @see https://orm.drizzle.team/docs/get-started-postgresql#neon
 */
const sql = neon(process.env.DATABASE_URL!);

export const db = drizzle(sql, { schema });
