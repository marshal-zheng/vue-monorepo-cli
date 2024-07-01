# Vue-Monorepo-Cli

`Vue-Monorepo-Cli` is a monolithic repository (monorepo) project that leverages Lerna, PNPM, Storybook, Vue 2, and Rollup to manage and build Vue.js components and applications.

## Features

- **Lerna** for managing JavaScript projects with multiple packages.
- **PNPM** for efficient and fast package management.
- **Storybook** for building UI components and pages in isolation.
- **Vue 2** for creating compelling user interfaces.
- **Rollup** for efficient bundling of JavaScript files.
- **Interactive CLI** for managing packages and components through a user-friendly command-line interface, supporting actions like create, remove, and rename.
- **Prompt Support**: Seamlessly add, delete, or rename packages and components through an interactive prompt, powered by a Node.js script.

### Prerequisites

Ensure you have Node.js and PNPM installed on your system.

#### Installing Node.js and PNPM

- **Node.js**: Visit [Node.js official website](https://nodejs.org/) and download the installer for your operating system. Follow the installation instructions.
- **PNPM**: After installing Node.js, you can install PNPM by running the following command in your terminal:

  ```bash
  npm install -g pnpm
  ```

1. **Clone the Repository**: Clone this repository to your local machine using the command:

   ```bash
   git clone git@github.com:marshal-zheng/vue-monorepo-cli.git
   ```
2. Navigate to the Project Directory: Change into the project directory with cd vue-monorepo-cli.
   ```bash
   cd vue-monorepo-cli
   ```
3. Install Dependencies: Run the following command to install the project dependencies:
   ```bash
   pnpm install
   ```
4. Run the Development Server: Start the development server to view the demonstration of a button component:
   ```bash
   pnpm dev
   ```

### Start the Project

To quickly start the project and view a demonstration of a button component, follow these steps:

1. **Open a Terminal**: Ensure you're in the project's root directory.
2. **Run the Development Server**: Execute the following command:

   ```bash
   pnpm dev
   ```

## Project Structure

This project follows a monorepo structure managed by Lerna and PNPM. Here's a brief overview of the key directories and files:

- `.storybook/`: Contains configuration files for Storybook, used for developing UI components in isolation.
  - `main.ts`: Main configuration file for Storybook.
  - `preview.ts`: Configuration for previewing Storybook components.
- `.template/`: Template files for creating new components or packages.
  - `src/`: Source code for the template.
    - `ComponentDemo.tsx`: Demo component template.
    - `index.ts`: Entry point for the template package.
  - `package.json`: Package definition for the template.
  - `tsconfig.json`: TypeScript configuration for the template.
- `docs/`: Documentation resources, including Storybook stories and additional guides.
  - `assets/`: Static assets used in documentation.
- `packages/`: Contains the source code for the individual packages managed within this monorepo.
  - `rollup-builder/`: A utility package for building and bundling JavaScript libraries.
    - `lib/`: Library code for the rollup-builder.
    - `package.json`: Package definition for rollup-builder.
    - `README.md`: Documentation for the rollup-builder package.
- `scripts/`: Scripts for managing components and packages within the monorepo.
  - `ComponentManager.js`: Manages UI components.
  - `index.js`: Entry point for scripts.
  - `PackageManager.js`: Manages packages within the monorepo.
- `types/`: TypeScript declaration files for enhancing type safety across the project.
  - `vue-types.d.ts`: Declaration files for Vue.js types.

Additionally, the project includes several configuration and metadata files:
- `lerna.json`: Configuration file for Lerna, defining how the monorepo is managed.
- `package.json`: Defines project metadata and lists dependencies. Includes scripts for common tasks.
- `pnpm-lock.yaml`: Locks the versions of all packages installed, ensuring consistent installs.
- `pnpm-workspace.yaml`: Configuration for managing workspaces with PNPM.
- `README.md`: The main documentation file for the project.
- `tsconfig.json`: Configuration file for TypeScript, specifying compiler options and project files.

## Managing Packages with Lerna and PNPM

This project uses Lerna and PNPM for managing packages in a monorepo setup. Below are some common commands you'll find useful:

### Adding a Dependency


- **To add a dependency to a specific package within the monorepo:**
  ```bash
  pnpm add <package-name> --filter <package-directory>
  ```

- **To add a dependency to all packages in the monorepo:**
  ```bash
  pnpm add -w <package-name>
  ```
  > **Tip:** The `-w` or `--workspace-root` flag adds the package to the root [`package.json`](command:_github.copilot.openRelativePath?%5B%7B%22scheme%22%3A%22file%22%2C%22authority%22%3A%22%22%2C%22path%22%3A%22%2FUsers%2Fadmin%2FHQ%2Ftdui-new%2Fpackage.json%22%2C%22query%22%3A%22%22%2C%22fragment%22%3A%22%22%7D%5D "/Users/admin/HQ/tdui-new/package.json"), making it available to all packages.

- **To add a development dependency to all packages:**
  ```bash
  pnpm add -w -D <package-name>
  ```
  > **Tip:** The `-D` flag specifies that the package is a development dependency, meaning it will only be used for development purposes and not included in the production build.

- **Clean all node_modules directories:**
  ```bash
  pnpm clean
  ```
  > **Tip:** Removing the [`node_modules`](command:_github.copilot.openRelativePath?%5B%7B%22scheme%22%3A%22file%22%2C%22authority%22%3A%22%22%2C%22path%22%3A%22%2FUsers%2Fadmin%2FHQ%2Ftdui-new%2Fnode_modules%22%2C%22query%22%3A%22%22%2C%22fragment%22%3A%22%22%7D%5D "/Users/admin/HQ/tdui-new/node_modules") directory can help resolve conflicts and issues with dependencies by forcing a fresh install of all packages.

- **Build all packages:**
  ```bash
  pnpm build
  ```
  > **Tip:** This command runs the build script in every package that has it, in topological order (dependencies are built first).

- **Build a specific package:**
  ```bash
  pnpm build --scope <package-name>
  ```
  > **Tip:** This allows you to build only a specific package and its dependencies.

- **List all packages:**
  ```bash
  pnpm build --scope <package-name>
  ```
  > **Tip:** This allows you to build only a specific package and its dependencies.

### Managing Packages and Components
You can perform operations such as new, delete, and rename a a package or components using the interactive prompt mode, You can perform operations such as adding, deleting, and renaming packages and components using the interactive prompt mode.

```bash
1.pnpm new

2.pnpm delete

3.pnpm rename
```
>**Tip:** Follow the step-by-step guide to create packages and components; **Tip:** Use the interactive prompt to add, delete, or rename packages. The corresponding `package.json` and related keywords will be automatically updated.

You can also migrate existing packages to the `packages` directory using Git clone. 
>**Note:** 🟡 Since development and debugging are based on Storybook, which in turn relies on Webpack 5, additional Webpack plugin configurations are necessary for cloned repositories. These configurations should be added to `./storybook/main.ts`.

## Building Documentation Service

To compile the documentation into static files, You can run the following command:

```bash
pnpm build-docs
```

## Important Notice on Builder Support

The `webpack-builder` is currently not supported. You may use `rollup-builder` or configure your own builder settings in the upcoming package release.

## References and Acknowledgments

This project leverages a variety of technologies and tools to achieve its goals. Below are references to the documentation and guides for the key technologies used:

- [Lerna](https://lerna.js.org/) - A tool for managing JavaScript projects with multiple packages.
- [PNPM](https://pnpm.io/) - A fast, disk space efficient package manager.
- [Storybook](https://storybook.js.org/) - An open source tool for developing UI components in isolation for React, Vue, and Angular.
- [Vue.js](https://vuejs.org/) - The Progressive JavaScript Framework for building user interfaces.
- [Rollup](https://rollupjs.org/guide/en/) - A module bundler for JavaScript which compiles small pieces of code into something larger and more complex, such as a library or application.
- [TypeScript](https://www.typescriptlang.org/) - An open-source language which builds on JavaScript, one of the world’s most used tools, by adding static type definitions.
- [Node.js](https://nodejs.org/en/docs/) - A JavaScript runtime built on Chrome's V8 JavaScript engine, enabling JavaScript to be used for server-side scripting.

Special thanks to the developers and contributors of these projects for providing such powerful tools and resources to the open-source community.
