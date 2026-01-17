import * as fs from 'fs';
import * as path from 'path';
import { Client } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const SEED_DIR = path.resolve(__dirname, '../../../database/seeders');
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL is not set in .env');
  process.exit(1);
}

async function runSeeds() {
  const client = new Client({ connectionString: DATABASE_URL });
  try {
    await client.connect();
    const files = fs.readdirSync(SEED_DIR)
      .filter(f => f.endsWith('.seed.sql'))
      .sort();
    for (const file of files) {
      const filePath = path.join(SEED_DIR, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      console.log(`\nRunning seed: ${file}`);
      await client.query(sql);
      console.log(`Seeded: ${file}`);
    }
    console.log('\nAll seeds executed successfully!');
  } catch (err) {
    console.error('Error running seeds:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runSeeds();
