/**
 * @fileoverview Password hashing migration script.
 *
 * Run this script once before starting the application if your users.json file
 * contains plain-text passwords (as it does in the initial seed data).
 *
 * What it does :
 * 1. Reads src/data/users.json
 * 2. For each user whose password is NOT already a bcrypt hash, hashes the password
 * 3. Writes the updated file back in place
 *
 * It is safe to run multiple times. A bcrypt hash always starts with "$2b$" or "$2a$",
 * so already-hashed passwords are detected and skipped without modification.
 *
 * Usage :
 *   node scripts/hash-passwords.js
 *
 * @module scripts/hash-passwords
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The bcrypt cost factor. Must match the value used in the application (src/app/api/users/route.jsx).
 * @constant {number}
 */
const BCRYPT_COST = 12;

/**
 * Prefix that all bcrypt hashes start with.
 * Used to detect already-hashed passwords so we do not double-hash them.
 * @constant {string}
 */
const BCRYPT_PREFIX = '$2';

// Resolve the path to users.json relative to this script file
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const usersFilePath = path.join(__dirname, '..', 'src', 'data', 'users.json');


// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
    console.log('Reading users file...');
    console.log(`Path : ${usersFilePath}`);

    // Read the users file
    let users;
    try {
        const raw = await fs.readFile(usersFilePath, 'utf-8');
        users = JSON.parse(raw);
    } catch (err) {
        console.error('Could not read users.json :', err.message);
        process.exit(1);
    }

    console.log(`Found ${users.length} user(s).`);

    let hashedCount = 0;
    let skippedCount = 0;

    // Process each user
    for (const user of users) {
        if (user.password.startsWith(BCRYPT_PREFIX)) {
            // Password is already a bcrypt hash — skip it
            console.log(`  Skipping ${user.email} (already hashed)`);
            skippedCount++;
        } else {
            // Password is plain text — hash it
            console.log(`  Hashing password for ${user.email}...`);
            user.password = await bcrypt.hash(user.password, BCRYPT_COST);
            hashedCount++;
        }
    }

    // Write the updated data back to the file
    try {
        await fs.writeFile(usersFilePath, JSON.stringify(users, null, 4));
        console.log('\nDone.');
        console.log(`  Hashed  : ${hashedCount} password(s)`);
        console.log(`  Skipped : ${skippedCount} password(s) (already hashed)`);
    } catch (err) {
        console.error('Could not write users.json :', err.message);
        process.exit(1);
    }
}

main();
