#!/usr/bin/env node

/**
 * Testmo Session Management Script
 * 
 * Usage:
 *   node scripts/manage-sessions.js create-exploratory --name "My Session"
 *   node scripts/manage-sessions.js create-verification --run-id 123
 *   node scripts/manage-sessions.js list-active
 *   node scripts/manage-sessions.js list-closed
 *   node scripts/manage-sessions.js get --id 456
 *   node scripts/manage-sessions.js close --id 456
 */

require('dotenv').config();
const SessionManager = require('../src/utils/session-manager');

const args = process.argv.slice(2);
const command = args[0];

// Get environment variables
const testmoInstance = process.env.TESTMO_INSTANCE;
const testmoProjectId = process.env.TESTMO_PROJECT_ID;
const testmoApiKey = process.env.TESTMO_API_KEY;

if (!testmoInstance || !testmoProjectId || !testmoApiKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   TESTMO_INSTANCE');
  console.error('   TESTMO_PROJECT_ID');
  console.error('   TESTMO_API_KEY');
  console.error('');
  console.error('Add these to your .env file or export them.');
  process.exit(1);
}

const sessionManager = new SessionManager(testmoInstance, testmoProjectId, testmoApiKey);

async function main() {
  try {
    switch (command) {
      case 'create-exploratory': {
        const nameIndex = args.indexOf('--name');
        const name = nameIndex >= 0 && args[nameIndex + 1] ? args[nameIndex + 1] : null;
        
        const missionIndex = args.indexOf('--mission');
        const mission = missionIndex >= 0 && args[missionIndex + 1] ? args[missionIndex + 1] : null;
        
        const configIndex = args.indexOf('--config');
        const configuration = configIndex >= 0 && args[configIndex + 1] ? args[configIndex + 1] : null;
        
        const tagsIndex = args.indexOf('--tags');
        const tags = tagsIndex >= 0 && args[tagsIndex + 1] ? args[tagsIndex + 1].split(',') : null;
        
        const assignedIndex = args.indexOf('--assigned-to');
        const assignedTo = assignedIndex >= 0 && args[assignedIndex + 1] ? parseInt(args[assignedIndex + 1]) : null;
        
        const session = await sessionManager.createExploratorySession({
          name,
          mission,
          configuration,
          tags,
          assignedTo
        });
        console.log('\n✅ Session created successfully!');
        console.log(JSON.stringify(session, null, 2));
        break;
      }

      case 'create-verification': {
        const runIdIndex = args.indexOf('--run-id');
        if (runIdIndex < 0 || !args[runIdIndex + 1]) {
          console.error('❌ --run-id is required for create-verification');
          process.exit(1);
        }
        const runId = parseInt(args[runIdIndex + 1]);
        
        const nameIndex = args.indexOf('--name');
        const name = nameIndex >= 0 && args[nameIndex + 1] ? args[nameIndex + 1] : null;
        
        const assignedIndex = args.indexOf('--assigned-to');
        const assignedTo = assignedIndex >= 0 && args[assignedIndex + 1] ? parseInt(args[assignedIndex + 1]) : null;
        
        const session = await sessionManager.createVerificationSession({
          runId,
          name,
          assignedTo
        });
        console.log('\n✅ Verification session created successfully!');
        console.log(JSON.stringify(session, null, 2));
        break;
      }

      case 'list-active': {
        const sessions = await sessionManager.listActiveSessions();
        console.log(`\n📋 Active Sessions (${sessions.length || 0}):`);
        if (sessions.length === 0) {
          console.log('   No active sessions found.');
        } else {
          sessions.forEach(session => {
            console.log(`   - [${session.id}] ${session.name} (${session.state || 'active'})`);
          });
        }
        break;
      }

      case 'list-closed': {
        const sessions = await sessionManager.listClosedSessions();
        console.log(`\n📋 Closed Sessions (${sessions.length || 0}):`);
        if (sessions.length === 0) {
          console.log('   No closed sessions found.');
        } else {
          sessions.forEach(session => {
            console.log(`   - [${session.id}] ${session.name} (${session.state || 'closed'})`);
          });
        }
        break;
      }

      case 'get': {
        const idIndex = args.indexOf('--id');
        if (idIndex < 0 || !args[idIndex + 1]) {
          console.error('❌ --id is required for get command');
          process.exit(1);
        }
        const sessionId = parseInt(args[idIndex + 1]);
        const session = await sessionManager.getSession(sessionId);
        console.log('\n📋 Session Details:');
        console.log(JSON.stringify(session, null, 2));
        break;
      }

      case 'close': {
        const idIndex = args.indexOf('--id');
        if (idIndex < 0 || !args[idIndex + 1]) {
          console.error('❌ --id is required for close command');
          process.exit(1);
        }
        const sessionId = parseInt(args[idIndex + 1]);
        const session = await sessionManager.closeSession(sessionId);
        console.log('\n✅ Session closed successfully!');
        console.log(JSON.stringify(session, null, 2));
        break;
      }

      default:
        console.log('Testmo Session Management');
        console.log('');
        console.log('Usage:');
        console.log('  node scripts/manage-sessions.js <command> [options]');
        console.log('');
        console.log('Commands:');
        console.log('  create-exploratory          Create a new exploratory session');
        console.log('    --name <name>            Session name (required)');
        console.log('    --mission <text>        Mission/description');
        console.log('    --config <config>        Configuration/environment');
        console.log('    --tags <tag1,tag2>       Comma-separated tags');
        console.log('    --assigned-to <user-id>  Assign to user ID');
        console.log('');
        console.log('  create-verification        Create verification session for automated run');
        console.log('    --run-id <id>           Automation run ID (required)');
        console.log('    --name <name>            Session name (optional)');
        console.log('    --assigned-to <user-id>  Assign to user ID');
        console.log('');
        console.log('  list-active                 List all active sessions');
        console.log('  list-closed                 List all closed sessions');
        console.log('  get --id <id>              Get session details');
        console.log('  close --id <id>            Close a session');
        console.log('');
        console.log('Examples:');
        console.log('  node scripts/manage-sessions.js create-exploratory --name "Test Session"');
        console.log('  node scripts/manage-sessions.js create-verification --run-id 123');
        console.log('  node scripts/manage-sessions.js list-active');
        console.log('  node scripts/manage-sessions.js get --id 456');
        process.exit(1);
    }
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    if (error.stack && process.env.DEBUG) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main();

