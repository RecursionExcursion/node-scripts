import { execSync } from "child_process";
import fs from "fs";

const isNonEmptyString = (/** @type {string} */ value) => {
  return typeof value === "string" && value !== "";
};

const executors = {
  terminal: (/** @type {string} */ command) => {
    if (!isNonEmptyString(command)) {
      throw new Error("Invalid command");
    }
    execSync(command, { stdio: "inherit" });
  },

  createDir: (/** @type {string} */ dirPath) => {
    if (!isNonEmptyString(dirPath)) {
      throw new Error("Invalid directory name");
    }
    fs.mkdirSync(dirPath);
  },

  writeFile: (
    /** @type {string} */ filePath,
    /** @type {string} */ content
  ) => {
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

const dependencies = ["express", "dotenv"];

const devDependencies = [
  "typescript",
  "ts-node",
  "@types/express",
  "nodemon",
  "eslint",
  "@eslint/js",
  "typescript-eslint",
];

const scripts = new Map([
  ["start", "nodemon"],
  ["build", "tsc"],
]);

executors.terminal("npm init -y");

executors.terminal(`npm i -S ${dependencies.join(" ")}`);
executors.terminal(`npm i -D ${devDependencies.join(" ")}`);

executors.terminal("npx tsc --init");
executors.terminal("npm init @eslint/config");

executors.writeFile(".env", `PORT=${PORT}`);

executors.writeFile(
  "./tsconfig.json",
  `{
        "compilerOptions": {
            "target": "es5",
            "module": "commonjs",
            "sourceMap": true,
            "outDir": "./build",
            "rootDir": "./src",
            /* Strict Type-Checking Options */
            "strict": true,
            "noImplicitAny": true,
            /* Module Resolution Options */
            "moduleResolution": "node",
            "baseUrl": "./src",
            "esModuleInterop": true,
            /* Advanced Options */
            "skipLibCheck": true,
            "forceConsistentCasingInFileNames": true
        },
        "lib": ["es2015"],
        "include": ["src/**/*"],
        "exclude": ["node_modules"]
    }`
);

executors.writeFile(
  "nodemon.json",
  `{
        "watch": ["src"],
        "ext": ".ts",
        "ignore": [],
        "exec": "ts-node ./src/index.ts"
    }`
);

executors.writeFile(
  ".eslintignore",
  `node_modules
build`
);

executors.writeFile(
  ".gitignore",
  `# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.js
.yarn/install-state.gz
  
# testing
/coverage
  
# next.js
/.next/
/out/
  
# production
/build
  
# misc
.DS_Store
*.pem
  
# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
  
# local env files
.env*.local
  
# vercel
.vercel
  
# typescript
*.tsbuildinfo
next-env.d.ts
  
.env
./build`
);

const addScripts = (/** @type {Map} */ scriptsMap) => {
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
};
addScripts(scripts);

executors.createDir("./src");
executors.writeFile(
  "./src/index.ts",
  ` import express, { Application, Request, Response, NextFunction } from 'express';
    import dotenv from 'dotenv';

    dotenv.config();
    
    // Boot express
    const app: Application = express();
    const PORT = process.env.PORT;
    app.use(express.json());
    
    // Application routing
    app.use('/', (req: Request, res: Response, next: NextFunction ) => {
        res.status(200).send({data: 'Hello World!'});
    });
    
    // Start server
    app.listen(PORT, () => console.log(\`Server is listening on PORT: \${PORT}!\`));
     `
);
