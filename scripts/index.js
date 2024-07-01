import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import minimist from 'minimist';
import PackageManager from './PackageManager.js';
import ComponentManager from './ComponentManager.js';

const argv = minimist(process.argv.slice(2));
const __dirname = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let target = argv.target;
const action = argv.action;
const logo = `
  M   M  OOO  N   N  OOO  RRRR  EEEEE P   P  OOO
  MM MM O   O NN  N O   O R   R E     P   P O   O
  M M M O   O N N N O   O RRRR  EEEE  PPPP  O   O
  M   M O   O N  NN O   O R  R  E     P     O   O
  M   M  OOO  N   N  OOO  R   R EEEEE P      OOO
`;

async function handleAction(target, action) {
  const managers = {
    package: new PackageManager(__dirname),
    component: new ComponentManager(__dirname),
  };

  const validActions = {
    package: ['create', 'remove', 'rename'],
    component: ['create', 'remove'],
  };

  if (!managers[target]) {
    console.error(chalk.red('Invalid target'));
    return;
  }

  if (!validActions[target].includes(action)) {
    console.error(chalk.red(`Invalid action for ${target}`));
    return;
  }

  await managers[target][action]();
}

async function main() {
  console.log(chalk.hex('#3399FF')(logo));

  if (!target) {
    const answer = await inquirer.prompt([{
      type: 'list',
      name: 'target',
      message: chalk.yellow('Please select a target:'),
      choices: ['package', 'component'],
    }]);
    target = answer.target;
  }

  await handleAction(target, action);
}

main();