export function firstLetterToUpperCase(str: string) {
  if (str) {
    return str.slice(0, 1).toUpperCase() + str.slice(1);
  } else {
    return "";
  }
}
export function hyphen(str: string) {
  return str.replace(/\B([A-Z])/g, "-$1").toLowerCase();
}

export function camelCase(str: string) {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, "");
}

export const generatorComponentTemplate = (
  name: string,
  styleFileType: string = "less",
  isAutoCreateStyleFile: boolean,
  cssModules: boolean
) => `import { useState } from 'react';
${
  isAutoCreateStyleFile
    ? cssModules
      ? `import styles from './index.${styleFileType}';`
      : `import './index.${styleFileType}';`
    : ""
}

export const ${name} = () => {
  return <div ${
    isAutoCreateStyleFile
      ? `className=${cssModules ? `{styles.${name}}` : `"${hyphen(name)}"`}`
      : ""
  }>content</div>;
};`;

export const generatorPageTemplate = (
  name: string,
  styleFileType: string = "less",
  isAutoCreateStyleFile: boolean,
  cssModules: boolean
) => `import { useState } from 'react';
${
  isAutoCreateStyleFile
    ? cssModules
      ? `import styles from './index.${styleFileType}';`
      : `import './index.${styleFileType}';`
    : ""
}

const ${name} = () => {
  return <div ${
    isAutoCreateStyleFile
      ? `className=${cssModules ? `{styles.${name}}` : `"${hyphen(name)}"`}`
      : ""
  }>content</div>;
};
export default ${name}
`;
