import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import inquirer from 'inquirer';
import chalk from 'chalk';
import minimist from 'minimist';

const argv = minimist(process.argv.slice(2));

export default class PackageManager {
  constructor(dirname) {
    this.__dirname = dirname;
  }

  async create() {
    const creationMethodAnswer = await inquirer.prompt([{
      type: 'list',
      name: 'creationMethod',
      message: 'How would you like to create the package?',
      choices: ['manual creation', 'git clone'],
    }]);

    if (creationMethodAnswer.creationMethod === 'git clone') {
      const gitRepoAnswer = await inquirer.prompt([{
        type: 'input',
        name: 'gitRepo',
        message: 'Please enter the git repository URL:',
        validate: input => !!input || 'Repository URL cannot be empty.'
      }]);

      const packagesDir = path.join(this.__dirname, 'packages');
      // Extract the repository name from the git URL
      const repoName = gitRepoAnswer.gitRepo.split('/').pop().replace('.git', '');
      // Append the repository name to the packages directory path
      const repoDir = path.join(packagesDir, repoName);

      if (!fs.existsSync(repoDir)) {
        fs.mkdirSync(repoDir, { recursive: true });
      }

      try {
        execSync(`git clone ${gitRepoAnswer.gitRepo} ${repoDir}`, { stdio: 'inherit' });
        console.log(chalk.green('Successfully cloned package.'));
      } catch (error) {
        console.error(chalk.red('Failed to clone package:'), chalk.redBright(error));
        process.exit(1);
      }
      return; // End the method here if git clone was chosen
    }
  
    let packageName = argv.package;
    if (!packageName) {
      const answer = await inquirer.prompt([{
        type: 'input',
        name: 'packageName',
        message: 'Please enter the package name:',
        validate: input => !!input || 'Package name cannot be empty.'
      }]);
      packageName = answer.packageName;
    }

    const builderAnswer = await inquirer.prompt([{
      type: 'list',
      name: 'builder',
      message: chalk.blue('Choose a builder for your package:'),
      choices: ['rollup-builder', 'webpack-builder'],
      default: 'rollup-builder',
    }]);

    const componentNameAnswer = await inquirer.prompt([{
      type: 'input',
      name: 'componentName',
      message: chalk.green('Please set the component name:'),
      validate: input => !!input || chalk.red('Component name cannot be empty.'),
    }]);
    const componentName = componentNameAnswer.componentName;

    const packagesDir = path.join(this.__dirname, 'packages');
    const packageDir = path.join(packagesDir, packageName);
    const templateDir = path.join(this.__dirname, '.template');

    try {
      await fs.ensureDir(packageDir);
      await fs.copy(templateDir, packageDir);

      const packageJsonPath = path.join(packageDir, 'package.json');
      const packageJson = await fs.readJson(packageJsonPath);

      packageJson.name = `${packageName}`;
      packageJson.devDependencies = {
        ...packageJson.devDependencies,
        [builderAnswer.builder]: "workspace:^"
      };

      await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });

      const oldComponentPath = path.join(packageDir, 'src', 'ComponentDemo.tsx');
      const newComponentPath = path.join(packageDir, 'src', `${componentName}.tsx`);
      await fs.rename(oldComponentPath, newComponentPath);

      let content = await fs.readFile(newComponentPath, 'utf8');
      content = content.replaceAll('ComponentDemo', componentName);
      await fs.writeFile(newComponentPath, content, 'utf8');

      const indexPath = path.join(packageDir, 'src', 'index.ts');
      let indexContent = `export * from './${componentName}';`;
      await fs.writeFile(indexPath, indexContent, 'utf8');

      const installDependenciesAnswer = await inquirer.prompt([{
        type: 'confirm',
        name: 'installDependencies',
        message: chalk.yellow('Do you want to install dependencies now?'),
        default: true,
      }]);

      if (installDependenciesAnswer.installDependencies) {
        execSync(`pnpm install --filter ${packageName} --registry=https://registry.npmmirror.com/`, { stdio: 'inherit' });
      }

      console.log(chalk.green(`Successfully created package ${packageName} with custom template.`));
    } catch (error) {
      console.error(chalk.red('Failed to create package:'), chalk.redBright(error));
      process.exit(1);
    }
  }

  async remove(packageName) {
    if (!packageName) {
      const packages = execSync('lerna list --all --json --ignore rollup-builder', { encoding: 'utf8' });
      const packageNames = JSON.parse(packages).map(pkg => pkg.name);

      if (packageNames.length === 0) {
        console.error(chalk.red('No packages found.'));
        process.exit(1);
      }

      const nameAnswer = await inquirer.prompt([{
        type: 'list',
        name: 'packageName',
        message: chalk.yellow('Please select a package to remove:'),
        choices: packageNames,
      }]);
      packageName = nameAnswer.packageName;
    }

    const packageDir = path.join(this.__dirname, 'packages', packageName);

    try {
      const exists = await fs.pathExists(packageDir);
      if (!exists) {
        console.error(chalk.red(`Error: Package ${packageName} does not exist.`));
        process.exit(1);
      }
      await fs.remove(packageDir);
      console.log(chalk.green(`Successfully removed package ${packageName}.`));
    } catch (error) {
      console.error(chalk.red('Failed to remove package:'), chalk.redBright(error));
      process.exit(1);
    }
  }

  async rename() {
    const packages = execSync('lerna list --all --json --ignore rollup-builder', { encoding: 'utf8' });
    const packageNames = JSON.parse(packages).map(pkg => pkg.name);

    if (packageNames.length === 0) {
      console.error(chalk.red('No packages found.'));
      process.exit(1);
    }

    const { oldPackageName, newPackageName } = await inquirer.prompt([
      {
        type: 'list',
        name: 'oldPackageName',
        message: chalk.yellow('Please select a package to rename:'),
        choices: packageNames,
      },
      {
        type: 'input',
        name: 'newPackageName',
        message: chalk.green('Please enter the new package name:'),
        validate: input => !!input || 'Package name cannot be empty.'
      }
    ]);

    const packagesDir = path.join(this.__dirname, 'packages');
    const oldPackagePath = path.join(packagesDir, oldPackageName);
    const newPackagePath = path.join(packagesDir, newPackageName);

    try {
      await fs.access(oldPackagePath);
    } catch (error) {
      console.error(`Error: Package ${oldPackageName} does not exist.`);
      return;
    }

    await fs.rename(oldPackagePath, newPackagePath);

    const packageJsonPath = path.join(newPackagePath, 'package.json');
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
    packageJson.name = newPackageName;
    await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');

    console.log(chalk.green(`Successfully renamed package from ${oldPackageName} to ${newPackageName}.`));
  }
}