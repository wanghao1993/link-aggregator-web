/**
 * Script to run database migrations
 * Run with: npx tsx scripts/run-migration.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { readFileSync } from 'fs';

config({ path: resolve(process.cwd(), '.env.local') });

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function runMigration() {
  const migrationFile = process.argv[2] || '008_categories_and_admin.sql';
  const migrationPath = resolve(process.cwd(), 'supabase/migrations', migrationFile);

  console.log(`Running migration: ${migrationFile}`);
  console.log(`Path: ${migrationPath}\n`);

  try {
    const sql = readFileSync(migrationPath, 'utf-8');

    // Split by semicolons and execute each statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const statement of statements) {
      try {
        // Use raw query via RPC
        const { error } = await supabase.rpc('exec_sql', { query: statement + ';' });

        // If RPC doesn't exist, try direct approach
        if (error && error.message.includes('function') && error.message.includes('does not exist')) {
          // For Supabase, we need to use the SQL editor or direct connection
          console.log('Note: Direct SQL execution requires Supabase SQL Editor or psql');
          console.log('\nPlease run this migration manually in Supabase Dashboard:');
          console.log('1. Go to SQL Editor');
          console.log('2. Copy and paste the contents of:');
          console.log(`   supabase/migrations/${migrationFile}`);
          console.log('3. Click Run\n');
          console.log('--- SQL Content ---\n');
          console.log(sql);
          return;
        }

        if (error && !error.message.includes('already exists')) {
          console.error(`Error in statement: ${statement.substring(0, 50)}...`);
          console.error(error.message);
        }
      } catch (e) {
        // Ignore errors for individual statements
      }
    }

    console.log('✅ Migration completed (check for any errors above)');
  } catch (error) {
    console.error('Failed to read migration file:', error);
    process.exit(1);
  }
}

runMigration();
