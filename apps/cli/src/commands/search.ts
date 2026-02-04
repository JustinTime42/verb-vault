import chalk from 'chalk'
import ora from 'ora'
import { searchThemes } from '../utils/api.js'

interface SearchOptions {
  tag?: string
  limit?: string
}

export async function searchCommand(query: string, options: SearchOptions) {
  const spinner = ora('Searching themes...').start()

  try {
    const limit = parseInt(options.limit || '10', 10)
    const themes = await searchThemes(query, options.tag, limit)

    spinner.stop()

    console.log()
    console.log(chalk.magenta.bold(`  🔍 Search Results for "${query}"`))
    console.log()

    if (themes.length === 0) {
      console.log(chalk.gray('  No themes found matching your search.'))
      console.log()
      console.log(chalk.white('  Try different keywords or browse all themes at:'))
      console.log(chalk.cyan('    https://verbvault.io/explore'))
      console.log()
      return
    }

    themes.forEach((theme: any, index: number) => {
      console.log(chalk.white.bold(`  ${index + 1}. ${theme.name}`))
      console.log(chalk.gray(`     ${theme.description || 'No description'}`))
      console.log(chalk.gray(`     Slug: ${chalk.cyan(theme.slug)}`))
      console.log(chalk.gray(`     Verbs: ${theme.verbs?.length || 0} | Downloads: ${theme.download_count || 0}`))
      if (theme.tags && theme.tags.length > 0) {
        console.log(chalk.gray(`     Tags: ${theme.tags.join(', ')}`))
      }
      console.log()
    })

    console.log(chalk.white('  Install a theme:'))
    console.log(chalk.cyan(`    $ npx verbvault install ${themes[0].slug}`))
    console.log()
  } catch (error) {
    spinner.fail(chalk.red('Search failed'))
    console.error(chalk.red((error as Error).message))
    process.exit(1)
  }
}
