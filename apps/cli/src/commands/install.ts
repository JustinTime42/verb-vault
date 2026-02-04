import chalk from 'chalk'
import ora from 'ora'
import { fetchTheme } from '../utils/api.js'
import { readClaudeSettings, writeClaudeSettings, getClaudeSettingsPath } from '../utils/settings.js'

interface InstallOptions {
  force?: boolean
}

export async function installCommand(themeSlug: string, options: InstallOptions) {
  const spinner = ora('Fetching theme...').start()

  try {
    // Fetch theme from API
    const theme = await fetchTheme(themeSlug)

    if (!theme) {
      spinner.fail(chalk.red(`Theme "${themeSlug}" not found`))
      console.log(chalk.gray('\nTry searching for themes:'))
      console.log(chalk.cyan(`  $ npx verbvault search "${themeSlug}"`))
      process.exit(1)
    }

    spinner.text = 'Reading Claude settings...'

    // Read current settings
    const settingsPath = getClaudeSettingsPath()
    const settings = await readClaudeSettings()

    // Check if verbs already exist
    const hasExistingVerbs = settings.spinnerVerbs?.verbs && settings.spinnerVerbs.verbs.length > 0

    if (hasExistingVerbs && !options.force) {
      spinner.warn(chalk.yellow('Existing verbs found'))
      console.log()
      console.log(chalk.gray('Current verbs will be replaced. Use --force to confirm:'))
      console.log(chalk.cyan(`  $ npx verbvault install ${themeSlug} --force`))
      console.log()
      console.log(chalk.gray('Or use "merge" to add to existing (coming soon)'))
      process.exit(0)
    }

    spinner.text = 'Installing theme...'

    // Update settings
    settings.spinnerVerbs = settings.spinnerVerbs || {}
    settings.spinnerVerbs.mode = 'replace'
    settings.spinnerVerbs.verbs = theme.verbs

    // Track installed theme metadata
    settings._verbvault = settings._verbvault || { installedThemes: [] }
    settings._verbvault.installedThemes = settings._verbvault.installedThemes.filter(
      (t: any) => t.slug !== theme.slug
    )
    settings._verbvault.installedThemes.push({
      slug: theme.slug,
      name: theme.name,
      installedAt: new Date().toISOString(),
      verbCount: theme.verbs.length,
    })

    // Write updated settings
    await writeClaudeSettings(settings)

    spinner.succeed(chalk.green('Theme installed successfully!'))

    console.log()
    console.log(chalk.white.bold(`  ${theme.name}`))
    console.log(chalk.gray(`  ${theme.verbs.length} verbs added to your spinner`))
    console.log()
    console.log(chalk.gray(`  Settings file: ${settingsPath}`))
    console.log()
    console.log(chalk.white('  Sample verbs:'))
    theme.verbs.slice(0, 5).forEach((verb: string) => {
      console.log(chalk.magenta(`    ◐ ${verb}...`))
    })
    if (theme.verbs.length > 5) {
      console.log(chalk.gray(`    ... and ${theme.verbs.length - 5} more`))
    }
    console.log()
    console.log(chalk.green('  Restart Claude Code to see your new spinner!'))
    console.log()
  } catch (error) {
    spinner.fail(chalk.red('Installation failed'))
    console.error(chalk.red((error as Error).message))
    process.exit(1)
  }
}
