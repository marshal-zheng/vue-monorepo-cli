import fs from 'fs-extra';
import path from 'path';
import inquirer from 'inquirer';
import chalk from 'chalk';
import minimist from 'minimist';
import { execSync } from 'child_process';

const argv = minimist(process.argv.slice(2)); 
const isCommandLineArgsProvided = argv.target && argv.dir !== undefined && argv.name && argv.package;

export default class ComponentManager {
  constructor(dirname) {
    this.__dirname = dirname;
  }

  async create() {
    const packages = execSync('lerna list --all --json --ignore rollup-builder', { encoding: 'utf8' });
    const packageNames = JSON.parse(packages).map(pkg => pkg.name);
    const packagesDir = path.join(this.__dirname, 'packages');
    const templateDir = path.join(this.__dirname, '.template');

    if (packageNames.length === 0) {
      console.error(chalk.red('No packages found.'));
      process.exit(1);
    }

    let answers;
    const isCommandLineArgsProvided = argv.package && argv.dir && argv.name;
    if (!isCommandLineArgsProvided) {
      answers = await inquirer.prompt([
        {
          type: 'list',
          name: 'packageName',
          message: 'Which package should the component be added to?',
          choices: packageNames,
        },
        {
          type: 'input',
          name: 'folderName',
          message: 'Folder name (leave empty to place in package src):',
          default: '',
        },
        {
          type: 'input',
          name: 'componentName',
          message: 'Component name:',
          validate: input => input !== '' ? true : 'Component name cannot be empty.',
        }
      ]);
    } else {
      answers = {
        packageName: argv.package,
        folderName: argv.dir,
        componentName: argv.name,
      };
    }

    const { packageName, componentName, folderName } = answers;
    let baseDir = path.join(packagesDir, packageName, 'src', folderName);

    await fs.ensureDir(baseDir);

    const componentPath = path.join(baseDir, `${componentName}.tsx`);
    const componentExists = await fs.pathExists(componentPath);

    if (componentExists) {
      console.log(chalk.red(`${componentName} Component already exists in ${baseDir}.`));
      process.exit(1);
    }

    const templateContent = await fs.readFile(path.join(templateDir, 'src', 'ComponentDemo.tsx'), 'utf8');
    const componentContent = templateContent.replace(/ComponentDemo/g, componentName);

    await fs.writeFile(componentPath, componentContent);

    // Ensure the directory for index.ts exists before attempting to read or write
    const indexPath = path.join(baseDir, 'index.ts');
    await fs.ensureFile(indexPath); // This ensures that the file and its directory structure exist

    let indexContent;
    try {
      indexContent = await fs.readFile(indexPath, 'utf8');
    } catch (error) {
      indexContent = ''; // If the file does not exist, start with an empty string
    }

    const exportStatement = `export * from './${componentName}';`;
    if (!indexContent.includes(exportStatement)) {
      indexContent += `\n${exportStatement}`;
      await fs.writeFile(indexPath, indexContent);
    } else {
      console.log(chalk.yellow(`Reference to ${componentName} already exists in index.ts.`));
    }

    // Ensure the directory for the folder's index.ts exists before attempting to read or write
    const folderIndexPath = path.join(baseDir, '..', 'index.ts');
    await fs.ensureFile(folderIndexPath); // This ensures that the file and its directory structure exist

    let folderIndexContent;
    try {
      folderIndexContent = await fs.readFile(folderIndexPath, 'utf8');
    } catch (error) {
      folderIndexContent = ''; // If the file does not exist, start with an empty string
    }

    const folderExportStatement = `export * from './${path.basename(baseDir)}';`;
    if (!folderIndexContent.includes(folderExportStatement)) {
      folderIndexContent += `\n${folderExportStatement}`;
      await fs.writeFile(folderIndexPath, folderIndexContent);
    } else {
      console.log(chalk.yellow(`Reference to ${path.basename(baseDir)} already exists in the folder's index.ts.`));
    }

    console.log(`Component ${componentName} created successfully in package ${packageName}${folderName ? ' under ' + folderName : ''}.`);
  }

  async updateIndexFile(baseDir, removedName) {
    const indexPath = path.join(baseDir, 'index.ts');
    if (await fs.pathExists(indexPath)) {
      let indexContent = await fs.readFile(indexPath, 'utf8');
      // Construct a regex pattern to match the export line for the removed component or directory
      // This pattern accounts for different quote styles and optional spaces
      let fileNameWithoutExtension = removedName.split('.')[0];
      const exportPattern = new RegExp(`export\\s+.*from\\s+['"]\\./${fileNameWithoutExtension}['"];?\\r?\\n?`, 'g');
      console.log('indexContent:', indexContent)
      // Remove the matching export line
      indexContent = indexContent.replace(exportPattern, '');
      // Write the updated content back to the index.ts file
      await fs.writeFile(indexPath, indexContent, 'utf8');
      console.log(chalk.green(`Updated index.ts to remove references to ${fileNameWithoutExtension}.`));
    }
  }

  async remove() {
    let answers;
    if (!isCommandLineArgsProvided) {
      const packages = execSync('lerna list --all --json --ignore rollup-builder', { encoding: 'utf8' });
      const packageNames = JSON.parse(packages).map(pkg => pkg.name);
  
      const packageAnswer = await inquirer.prompt([
        {
          type: 'list',
          name: 'packageName',
          message: 'From which package should the components be removed?',
          choices: packageNames,
        }
      ]);
  
      const packagesDir = path.join(this.__dirname, 'packages');
      const baseDir = path.join(packagesDir, packageAnswer.packageName, 'src');
      // List both components and directories
      const componentsAndDirs = fs.readdirSync(baseDir).map(file => {
        const isDirectory = fs.statSync(path.join(baseDir, file)).isDirectory();
        return { name: file, isDirectory };
      });
  
      const selection = await inquirer.prompt([
        {
          type: 'list',
          name: 'selection',
          message: 'Select a component or directory:',
          choices: componentsAndDirs
          .filter(item => item.name !== 'index.ts') // Filter out 'index.ts'
          .map(item => ({
            name: item.name + (item.isDirectory ? '/' : ''),
            value: { name: item.name, isDirectory: item.isDirectory }
          })),
        }
      ]);
  
      if (selection.selection.isDirectory) {
        const dirAction = await inquirer.prompt([
          {
            type: 'list',
            name: 'action',
            message: 'Do you want to delete the entire directory or select specific components within it?',
            choices: [
              { name: 'Delete entire directory', value: 'deleteDir' },
              { name: 'Select specific components', value: 'selectComponents' }
            ],
          }
        ]);
  
        if (dirAction.action === 'deleteDir') {
          const confirmDeletion = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'confirm',
              message: `Are you sure you want to delete the entire directory ${selection.selection.name}? This cannot be undone.`,
            }
          ]);
  
          if (confirmDeletion.confirm) {
            // Delete the directory
            const dirPath = path.join(baseDir, selection.selection.name);
            await fs.remove(dirPath);
            console.log(chalk.green(`Directory ${selection.selection.name} removed successfully.`));
          
            // Update the index.ts file to remove references to the deleted directory
            await this.updateIndexFile(baseDir, selection.selection.name);
            return;
          } else {
            console.log('Operation cancelled.');
            return;
          }
        } else if (dirAction.action === 'selectComponents') {
          // List components within the directory for deletion
          const dirPath = path.join(baseDir, selection.selection.name);
          const components = fs.readdirSync(dirPath).filter(file => file.endsWith('.tsx')).map(file => file.slice(0, -4));
  
          answers = await inquirer.prompt([
            {
              type: 'checkbox',
              name: 'componentNames',
              message: 'Select components to remove:',
              choices: components,
            }
          ]);
  
          answers.packageName = packageAnswer.packageName;
          // Adjust baseDir to include the selected directory
          baseDir = dirPath;
        }
      } else {
        // Single component selected for deletion
        answers = {
          packageName: packageAnswer.packageName,
          componentNames: [selection.selection.name],
        };

        const confirmDeletion = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirm',
            message: `Are you sure you want to delete the component ${selection.selection.name}? This cannot be undone.`,
          }
        ]);

        if (confirmDeletion.confirm) {
          // Delete the single component file
          const componentPath = path.join(baseDir, `${answers.componentNames[0]}`); // Assuming component files have .tsx extension
          console.log('componentPath: ', componentPath)
          if (fs.existsSync(componentPath)) {
            await fs.remove(componentPath);
            console.log(chalk.green(`Component ${answers.componentNames[0]} removed successfully.`));
            
            // Update the index.ts file to remove references to the deleted component
            await this.updateIndexFile(baseDir, answers.componentNames[0]);
          } else {
            console.log(chalk.red(`Component ${answers.componentNames[0]} does not exist.`));
          }
        } else {
          console.log('Operation cancelled.');
          return;
        }
      }
    } else {
      answers = {
        packageName: argv.package,
        componentNames: [argv.name],
      };
    }
  
    // Continue with deletion logic as before...
  }
  
}