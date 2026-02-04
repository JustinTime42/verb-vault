import chalk from 'chalk'
import ora from 'ora'
import { readClaudeSettings, writeClaudeSettings } from '../utils/settings.js'

export async function removeCommand(themeSlug: string) {
  const spinner = ora('Removing theme...').start()

  try {
    const settings = await readClaudeSettings()
    const installedThemes = settings._verbvault?.installedThemes || []

    const themeIndex = installedThemes.findIndex((t: any) => t.slug === themeSlug)

    if (themeIndex === -1) {
      spinner.warn(chalk.yellow(`Theme "${themeSlug}" not found in installed themes`))
      console.log()
      console.log(chalk.gray('  List installed themes:'))
      console.log(chalk.cyan('    $ npx verbvault list'))
      console.log()
      return
    }

    // Remove from installed themes list
    const removedTheme = installedThemes[themeIndex]
    installedThemes.splice(themeIndex, 1)
    settings._verbvault.installedThemes = installedThemes

    // Clear verbs if this was the only/current theme
    if (installedThemes.length === 0) {
      delete settings.spinner?.verbs
      if (settings.spinner && Object.keys(settings.spinner).length === 0) {
        delete settings.spinner
      }
    }

    await writeClaudeSettings(settings)

    spinner.succeed(chalk.green('Theme removed successfully!'))

    console.log()
    console.log(chalk.white.bold(`  Removed: ${removedTheme.name}`))
    console.log()

    if (installedThemes.length === 0) {
      console.log(chalk.gray('  Your spinner will now use default verbs.'))
      console.log()
      console.log(chalk.white('  Install a new theme:'))
      console.log(chalk.cyan('    $ npx verbvault search "space"'))
    } else {
      console.log(chalk.gray(`  ${installedThemes.length} theme(s) still installed.`))
    }

    console.log()
    console.log(chalk.green('  Restart Claude Code to apply changes.'))
    console.log()
  } catch (error) {
    spinner.fail(chalk.red('Removal failed'))
    console.error(chalk.red((error as Error).message))
    process.exit(1)
  }
}
