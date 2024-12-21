import { execSync } from "child_process";
import fs from "fs";

/** @param {string} value  */
const isNonEmptyString = (value) => {
  return typeof value === "string" && value !== "";
};

const executors = {
  /** @param {string} command  */
  terminal: (command) => {
    if (!isNonEmptyString(command)) {
      throw new Error("Invalid command");
    }
    execSync(command, { stdio: "inherit" });
  },

  /** @param {string} dirPath  */
  createDir: (dirPath) => {
    if (!isNonEmptyString(dirPath)) {
      throw new Error("Invalid directory name");
    }
    fs.mkdirSync(dirPath);
  },

  /**
   * @param {string} filePath
   * @param {string} content
   */
  writeFile: (filePath, content) => {
    if (!isNonEmptyString(filePath) || !isNonEmptyString(content)) {
      throw new Error("Invalid file path or content");
    }
    fs.writeFileSync(filePath, content);
  },

  readFile: (/** @type {any} */ filePath) => {
    if (!isNonEmptyString(filePath)) {
      throw new Error("Invalid path name");
    }

    const fileData = fs.readFileSync(filePath, "utf8");
    return fileData;
  },
};

const PORT = 8080;

function initializeNode() {
  executors.terminal("npm init -y");
}

function installDependencies() {
  const dependencies = ["express", "dotenv", "compression"];

  const devDependencies = [
    "typescript",
    "nodemon",
    "@types/express",
    "@types/compression",
    "@types/node",
  ];

  executors.terminal(`npm i -S ${dependencies.join(" ")}`);
  executors.terminal(`npm i -D ${devDependencies.join(" ")}`);
}

function initializeTS() {
  executors.terminal("tsc --init");
  executors.writeFile(
    "./tsconfig.json",
    [
      `{`,
      `"compilerOptions": {`,
      `"target": "es5",`,
      `"module": "commonjs",`,
      `"sourceMap": true,`,
      `"outDir": "./dist",`,
      `"rootDir": "./src",`,
      `/* Strict Type-Checking Options */`,
      `"strict": true,`,
      `"noImplicitAny": true,`,
      `/* Module Resolution Options */`,
      `"moduleResolution": "node",`,
      `"baseUrl": "./src",`,
      `"esModuleInterop": true,`,
      `/* Advanced Options */`,
      `"skipLibCheck": true,`,
      `"forceConsistentCasingInFileNames": true`,
      `},`,
      `"include": ["src/**/*"],`,
      `"exclude": ["node_modules"]`,
      `}`,
    ].join("\n")
  );
}

function createMiscFiles() {
  executors.writeFile(".env", `PORT=${PORT}`);
  executors.writeFile(
    ".gitignore",
    [
      "# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.",
      "\n",
      "# dependencies",
      "/node_modules",
      "\n",
      "# production",
      "/dist",
      "\n",
      "# debug",
      "npm-debug.log*",
      "yarn-debug.log*",
      "yarn-error.log*",
      "\n",
      "# typescript",
      "*.tsbuildinfo",
      "\n",
      "# enviroment",
      ".env",
    ].join("\n")
  );
}

function initNodemon() {
  executors.writeFile(
    "nodemon.json",
    [
      `{`,
      '"watch": ["src"],',
      '"ext": "ts",',
      '"exec": "tsc && node dist/index.js",',
      '"ignore": ["dist"],',
      '"restartable": "rs"',
      `}`,
    ].join("\n")
  );
}

function initalizeScripts() {
  /** @type {Map<string, string>} */
  const scripts = new Map([
    ["start", "node dist/index.js"],
    ["build", "tsc"],
    ["dev", "nodemon"],
  ]);
  /** @param {Map<string,string>} scriptsMap  */
  ((scriptsMap) => {
    const propertyOrder = [
      "name",
      "version",
      "description",
      "author",
      "license",
      "keywords",
      "main",
      "scripts",
      "dependencies",
      "devDependencies",
    ];

    const packageJsonPath = "./package.json";

    const packageJson = JSON.parse(executors.readFile(packageJsonPath));

    scriptsMap.forEach((v, k) => {
      packageJson.scripts[k] = v;
    });

    const orderedPackageJson = {};

    propertyOrder.forEach((property) => {
      if (packageJson.hasOwnProperty(property)) {
        orderedPackageJson[property] = packageJson[property];
      }
    });

    // Write the modified package.json back to file
    executors.writeFile(
      packageJsonPath,
      JSON.stringify(orderedPackageJson, null, 2)
    );
  })(scripts);
}

function createAppDir() {
  executors.createDir("./src");
  executors.writeFile(
    "./src/index.ts",
    [
      `import express, { Application, Request, Response, NextFunction } from 'express';`,
      `import dotenv from 'dotenv';`,
      `import compression from "compression";`,
      `\n`,
      `dotenv.config();`,
      `\n`,
      `// Boot express`,
      `const app: Application = express();`,
      `const PORT = process.env.PORT;`,
      `app.use(express.json());`,
      `\n`,
      `//Gzip`,
      `app.use(compression());`,
      `\n`,
      ` // Application routing`,
      `app.use('/', (req: Request, res: Response, next: NextFunction ) => {`,
      `res.status(200).send({data: 'Hello World!'});`,
      ` });`,
      `\n`,
      `// Start server`,
      ` app.listen(PORT, () => console.log(\`Server is listening on PORT: \${PORT}!\`));`,
    ].join("\n")
  );
}

initializeNode();
installDependencies();
initializeTS();
createMiscFiles();
initalizeScripts();
initNodemon();
createAppDir();
