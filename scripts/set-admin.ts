/**
 * Script to set a user as admin or create a new admin user
 * Run with: npx tsx scripts/set-admin.ts <email> [role]
 * Or create: npx tsx scripts/set-admin.ts <email> <name> --create
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setAdmin(email: string, role: 'admin' | 'super_admin' = 'super_admin') {
  try {
    // Find user by email
    const { data: user, error: findError } = await supabase
      .from('users')
      .select('id, name, email, role')
      .eq('email', email)
      .single();

    if (findError || !user) {
      console.error(`User with email "${email}" not found`);
      console.log('\nTo create a new admin user, run:');
      console.log(`  npm run set-admin ${email} "Your Name" --create`);
      process.exit(1);
    }

    // Update role
    const { error: updateError } = await supabase
      .from('users')
      .update({ role })
      .eq('id', user.id);

    if (updateError) {
      console.error('Failed to update user role:', updateError);
      process.exit(1);
    }

    console.log(`✅ Successfully set ${user.name} (${user.email}) as ${role}`);
    console.log('\nYou can now access the admin panel at /admin');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

async function createAdmin(email: string, name: string, role: 'admin' | 'super_admin' = 'super_admin') {
  try {
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, name, email, role')
      .eq('email', email)
      .single();

    if (existingUser) {
      console.log(`User ${email} already exists. Updating role to ${role}...`);

      const { error: updateError } = await supabase
        .from('users')
        .update({ role, name })
        .eq('id', existingUser.id);

      if (updateError) {
        console.error('Failed to update user:', updateError);
        process.exit(1);
      }

      console.log(`✅ Updated ${name} (${email}) to ${role}`);
      console.log('\nYou can now access the admin panel at /admin');
      return;
    }

    // Create new user
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        name,
        email,
        role,
        email_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (createError) {
      console.error('Failed to create user:', createError);
      process.exit(1);
    }

    // Create profile
    await supabase
      .from('profiles')
      .insert({
        user_id: newUser.id,
        username: email.split('@')[0],
        display_name: name,
      });

    console.log(`✅ Created admin user: ${name} (${email})`);
    console.log(`   Role: ${role}`);
    console.log('\nYou can now access the admin panel at /admin');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Parse arguments
const args = process.argv.slice(2);
const isCreate = args.includes('--create');

if (isCreate) {
  // npm run set-admin email "name" --create [role]
  const email = args[0];
  const name = args[1];
  const role = (args[3] as 'admin' | 'super_admin') || 'super_admin';

  if (!email || !name) {
    console.log('Usage: npm run set-admin <email> "name" --create [role]');
    console.log('\nExample:');
    console.log('  npm run set-admin admin@example.com "Admin User" --create');
    console.log('  npm run set-admin admin@example.com "Admin User" --create admin');
    process.exit(1);
  }

  createAdmin(email, name, role);
} else {
  // npm run set-admin email [role]
  const email = args[0];
  const role = (args[1] as 'admin' | 'super_admin') || 'super_admin';

  if (!email) {
    console.log('Usage: npm run set-admin <email> [role]');
    console.log('       npm run set-admin <email> "name" --create [role]');
    console.log('\nRoles: admin, super_admin (default: super_admin)');
    console.log('\nExamples:');
    console.log('  npm run set-admin user@example.com');
    console.log('  npm run set-admin user@example.com admin');
    console.log('  npm run set-admin admin@example.com "Admin User" --create');
    process.exit(1);
  }

  setAdmin(email, role);
}
