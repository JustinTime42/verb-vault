import { readFile, writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { homedir } from 'os'
import { join, dirname } from 'path'

export function getClaudeSettingsPath(): string {
  const home = homedir()

  // Check for custom path via environment variable
  if (process.env.CLAUDE_SETTINGS_PATH) {
    return process.env.CLAUDE_SETTINGS_PATH
  }

  // Default path: ~/.claude/settings.json
  return join(home, '.claude', 'settings.json')
}

export async function readClaudeSettings(): Promise<any> {
  const settingsPath = getClaudeSettingsPath()

  if (!existsSync(settingsPath)) {
    // Return empty settings if file doesn't exist
    return {}
  }

  try {
    const content = await readFile(settingsPath, 'utf-8')
    return JSON.parse(content)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return {}
    }
    throw new Error(`Failed to read settings file: ${(error as Error).message}`)
  }
}

export async function writeClaudeSettings(settings: any): Promise<void> {
  const settingsPath = getClaudeSettingsPath()
  const settingsDir = dirname(settingsPath)

  // Ensure directory exists
  if (!existsSync(settingsDir)) {
    await mkdir(settingsDir, { recursive: true })
  }

  // Write settings with pretty formatting
  const content = JSON.stringify(settings, null, 2)

  try {
    await writeFile(settingsPath, content, 'utf-8')
  } catch (error) {
    throw new Error(`Failed to write settings file: ${(error as Error).message}`)
  }
}

export async function backupSettings(): Promise<string | null> {
  const settingsPath = getClaudeSettingsPath()

  if (!existsSync(settingsPath)) {
    return null
  }

  const backupPath = `${settingsPath}.backup.${Date.now()}`

  try {
    const content = await readFile(settingsPath, 'utf-8')
    await writeFile(backupPath, content, 'utf-8')
    return backupPath
  } catch (error) {
    console.warn('Failed to create backup:', (error as Error).message)
    return null
  }
}
