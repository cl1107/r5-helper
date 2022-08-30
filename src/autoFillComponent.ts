import * as path from "path";
import * as fs from "fs";
import * as vscode from "vscode";
import {
  camelCase,
  firstLetterToUpperCase,
  generatorComponentTemplate,
  generatorPageTemplate,
  hyphen,
} from "./utils";
var minimatch = require("minimatch");

const srcDir = "src";
const monoRepoDir = "apps";
const monoRepoDir2 = "packages";

function checkIsCreatedDir(fsPath: string) {
  return path.extname(fsPath) === "";
}

function checkIsValidateType(fileName: string) {
  return [".jsx", ".tsx"].includes(path.extname(fileName));
}

function checkIsInValidatorFolder(fsPath: string) {
  const res = !!vscode.workspace.workspaceFolders?.find((workspaceFolder) => {
    return (
      fsPath.includes(path.join(workspaceFolder.uri.fsPath, srcDir)) ||
      fsPath.includes(path.join(workspaceFolder.uri.fsPath, monoRepoDir)) ||
      fsPath.includes(path.join(workspaceFolder.uri.fsPath, monoRepoDir2))
    );
  });
  return res;
}

function checkIsInPagesOrLayoutsOrWrapperDir(fsPath: string) {
  return !!vscode.workspace.workspaceFolders?.find((workspaceFolder) => {
    // const srcDirPath = path.join(workspaceFolder.uri.fsPath, srcDir);
    // const wrappersDirPath = path.join(srcDirPath, "wrappers");
    // const pagesDirPath = path.join(srcDirPath, "pages");
    // const layoutsDirPath = path.join(srcDirPath, "layouts");
    const matchRes =
      minimatch(
        fsPath,
        `${workspaceFolder.uri.fsPath}/**/+(pages|layouts|wrappers)/**/*`
      ) ||
      minimatch(
        fsPath,
        `${workspaceFolder.uri.fsPath}/**/+(pages|layouts|wrappers)/**/index.+(jsx|tsx)`
      );
    return matchRes;
  });
}
function checkIsInComponentDir(fsPath: string) {
  return !!vscode.workspace.workspaceFolders?.find((workspaceFolder) => {
    // const srcDirPath = path.join(workspaceFolder.uri.fsPath, srcDir);
    // const componentsDirPath = path.join(srcDirPath, "components");
    const matchRes =
      minimatch(
        fsPath,
        `${workspaceFolder.uri.fsPath}/**/components/**/index.+(jsx|tsx)`
      ) || minimatch(fsPath, `${workspaceFolder.uri.fsPath}/**/components/*`);

    return matchRes;
    // return fsPath.includes(componentsDirPath) || matchRes;
  });
}
const indexFilename = "index";
function checkIsIndexNames(name: string): boolean {
  return [indexFilename].includes(name);
}

// function getProjectLanguageType(path: string) {
//   try {
//     fs.accessSync(`${path}/tsconfig.json`);
//     return "ts";
//   } catch (error) {
//     return "js";
//   }
// }

function recursiveGetTsConfig(path: string, rootPath: string): string {
  try {
    fs.accessSync(`${path}/tsconfig.json`);
    return "ts";
  } catch (error) {
    if (path !== rootPath) {
      return recursiveGetTsConfig(
        path.slice(0, path.lastIndexOf("/")),
        rootPath
      );
    }
    return "js";
  }
}
/**
 * TODO
 * Code snippet effect, which can have a better editing experience
 */
async function filContent(fsPath: string, type: 1 | 2): Promise<string> {
  const isCreatedFolder = checkIsCreatedDir(fsPath);
  const workspaceRootPath = vscode.workspace.workspaceFolders?.find(
    (workspaceFolder) => fsPath.includes(workspaceFolder.uri.fsPath)
  )?.uri.fsPath as string;
  const filename = path.basename(fsPath, path.extname(fsPath));
  const dirname = path.basename(path.dirname(fsPath));
  // const name = firstLetterToUpperCase(
  //   checkIsIndexNames(filename) ? dirname : filename
  // );
  const name = firstLetterToUpperCase(
    camelCase(checkIsIndexNames(filename) ? dirname : filename)
  );
  // const projectType = await getProjectType(workspaceRootPath);
  // const templatePath = path.join(__dirname, `component.${projectType}.tsx.ejs`);
  // const content = await renderFileAsync(templatePath, { name });

  let newFsPath = fsPath;
  if (isCreatedFolder) {
    const projectLanguageType = recursiveGetTsConfig(fsPath, workspaceRootPath);
    // const projectLanguageType = getProjectLanguageType(workspaceRootPath);
    newFsPath = path.join(fsPath, `${indexFilename}.${projectLanguageType}x`);
  }

  // await writeFileAsync(newFsPath, content);
  const styleFileType = vscode.workspace
    .getConfiguration("r5-helper")
    .get<string>("styleFileType");
  const isAutoFillComponentCode = vscode.workspace
    .getConfiguration("r5-helper")
    .get("autoFillComponentCode");

  const isAutoCreateStyleFile = vscode.workspace
    .getConfiguration("r5-helper")
    .get("autoCreateStyleFile");
  console.log(
    "🚀 ~ file: autoFillComponent.ts ~ line 106 ~ filContent ~ isAutoCreateStyleFile",
    isAutoCreateStyleFile
  );

  if (isAutoFillComponentCode) {
    fs.writeFileSync(
      newFsPath,
      type === 1
        ? generatorComponentTemplate(
            name,
            styleFileType ?? "",
            isAutoCreateStyleFile as boolean
          )
        : generatorPageTemplate(
            name,
            styleFileType ?? "",
            isAutoCreateStyleFile as boolean
          )
    );
  }

  if (isAutoCreateStyleFile) {
    const lessTemplate = `.${hyphen(firstLetterToUpperCase(name))}{

}
`;

    fs.writeFileSync(
      `${path.dirname(newFsPath)}/${indexFilename}.${styleFileType}`,
      lessTemplate
    );
  }
  return newFsPath;
}

export default function () {
  vscode.workspace.onDidCreateFiles(async ({ files }) => {
    await Promise.all(
      files.map(async (file) => {
        const { fsPath } = file;
        //拖拽进来新增的有内容的文件就不要去覆盖他的内容了
        const res = fs.readFileSync(fsPath, { encoding: "utf-8" });
        if (res) {
          return;
        }
        const isInValidateFolder = checkIsInValidatorFolder(fsPath);
        if (isInValidateFolder) {
          const isCreatedFolder = checkIsCreatedDir(fsPath);
          const isInComponentDir = checkIsInComponentDir(fsPath);
          const isInPagesOrLayoutsOrWrapperDir =
            checkIsInPagesOrLayoutsOrWrapperDir(fsPath);
          if (isCreatedFolder) {
            const createdDirname = path.basename(fsPath);
            const isCreatedBlackListDir = [
              "hooks",
              "components",
              "models",
            ].includes(createdDirname);
            if (
              (isInComponentDir || isInPagesOrLayoutsOrWrapperDir) &&
              !isCreatedBlackListDir
            ) {
              const newFilename = await filContent(
                fsPath,
                isInComponentDir ? 1 : 2
              );
              await vscode.workspace.openTextDocument(newFilename);
            }
          } else if (!isCreatedFolder) {
            const isValidateType = checkIsValidateType(fsPath);
            const createdDirname = path.basename(path.dirname(fsPath));
            const createdFilename = path.basename(fsPath, path.extname(fsPath));
            const isCreatedBlackListFile =
              ["components"].includes(createdDirname) &&
              checkIsIndexNames(createdFilename);
            if (
              isValidateType &&
              !isCreatedBlackListFile &&
              (isInComponentDir || isInPagesOrLayoutsOrWrapperDir)
            ) {
              await filContent(fsPath, isInComponentDir ? 1 : 2);
            }
          }
        }
        // await autoFillInStore(file);
      })
    );
  });
}
