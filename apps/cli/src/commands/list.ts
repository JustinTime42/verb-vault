import chalk from 'chalk'
import { readClaudeSettings, getClaudeSettingsPath } from '../utils/settings.js'

export async function listCommand() {
  try {
    const settings = await readClaudeSettings()
    const installedThemes = settings._verbvault?.installedThemes || []
    const currentVerbs = settings.spinner?.verbs || []

    console.log()
    console.log(chalk.magenta.bold('  🎯 Installed Themes'))
    console.log()

    if (installedThemes.length === 0 && currentVerbs.length === 0) {
      console.log(chalk.gray('  No themes installed yet.'))
      console.log()
      console.log(chalk.white('  Get started:'))
      console.log(chalk.cyan('    $ npx verbvault search "pirate"'))
      console.log(chalk.cyan('    $ npx verbvault install pirates-treasure'))
      console.log()
      return
    }

    if (installedThemes.length > 0) {
      installedThemes.forEach((theme: any, index: number) => {
        console.log(chalk.white.bold(`  ${index + 1}. ${theme.name}`))
        console.log(chalk.gray(`     Slug: ${theme.slug}`))
        console.log(chalk.gray(`     Verbs: ${theme.verbCount}`))
        console.log(chalk.gray(`     Installed: ${new Date(theme.installedAt).toLocaleDateString()}`))
        console.log()
      })
    } else if (currentVerbs.length > 0) {
      console.log(chalk.white.bold('  Custom verbs detected'))
      console.log(chalk.gray(`  ${currentVerbs.length} verbs configured`))
      console.log()
      console.log(chalk.white('  Sample verbs:'))
      currentVerbs.slice(0, 5).forEach((verb: string) => {
        console.log(chalk.magenta(`    ◐ ${verb}...`))
      })
      if (currentVerbs.length > 5) {
        console.log(chalk.gray(`    ... and ${currentVerbs.length - 5} more`))
      }
      console.log()
    }

    console.log(chalk.gray(`  Settings file: ${getClaudeSettingsPath()}`))
    console.log()
  } catch (error) {
    console.error(chalk.red('Failed to read settings'))
    console.error(chalk.red((error as Error).message))
    process.exit(1)
  }
}
