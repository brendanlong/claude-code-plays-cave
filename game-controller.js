import { exec } from 'child_process';
import { promisify } from 'util';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __dirname = dirname(fileURLToPath(import.meta.url));

// Helper function to execute bash scripts
async function runScript(scriptPath, args = []) {
  try {
    const { stdout, stderr } = await execAsync(
      `${scriptPath} ${args.map(arg => `"${arg}"`).join(' ')}`,
      { cwd: __dirname }
    );
    return { success: true, output: stdout || stderr };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Game controller functions
export async function startGame(gameName) {
  return await runScript('./start_game.sh', [gameName]);
}

export async function sendCommand(command) {
  return await runScript('./send_command.sh', [command]);
}

export async function sendKeys(keys) {
  return await runScript('./send_key.sh', keys);
}

export async function readOutput() {
  return await runScript('./read_output.sh');
}

export async function endGame() {
  return await runScript('./end_game.sh');
}

// Tool schema definitions
export const toolSchemas = [
  {
    name: 'start_game',
    description: 'Start a new terminal game session',
    inputSchema: {
      type: 'object',
      properties: {
        game_name: {
          type: 'string',
          description: 'Name of the game to start (e.g., "adventure", "nethack")'
        }
      },
      required: ['game_name']
    }
  },
  {
    name: 'send_command',
    description: 'Send a text command to the running game',
    inputSchema: {
      type: 'object',
      properties: {
        command: {
          type: 'string',
          description: 'Text command to send to the game (e.g., "go north", "look")'
        }
      },
      required: ['command']
    }
  },
  {
    name: 'send_keys',
    description: 'Send special keys to the running game',
    inputSchema: {
      type: 'object',
      properties: {
        key: {
          type: 'array',
          items: {
            type: 'string'
          },
          description: 'Array of keys to send in sequence (e.g., ["Tab", "Enter"]).'
        }
      },
      required: ['key']
    }
  },
  {
    name: 'read_output',
    description: 'Read the current game output from the terminal',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'end_game',
    description: 'End the current game session',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  }
];

// Tool handler function
export async function handleToolCall(name, args) {
  switch (name) {
    case 'start_game':
      return await startGame(args.game_name);

    case 'send_command':
      return await sendCommand(args.command);

    case 'send_keys':
      return await sendKeys(args.key);

    case 'read_output':
      return await readOutput();

    case 'end_game':
      return await endGame();

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}