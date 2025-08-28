// @ts-check

import tailwindCss from "@tailwindcss/postcss";

// See https://github.com/tailwindlabs/tailwindcss/discussions/18108
// Tailwind always uses :root / :host, but we want to scope it to .jsonjoy
/** @type {() => import("postcss").Plugin} */
const ReplaceRootWithNewDesign = () => {
  const pattern = /^\s*(:root|:host)(\s*,\s*(:root|:host))+\s*$/;
  return {
    postcssPlugin: 'replace-root-with-new_design',
    Once(root) {
      root.walkRules(rule => {
        if (pattern.test(rule.selector)) {
          rule.selector = '.jsonjoy';
        }
      });
    }
  };
};


/** @type {{plugins:import("postcss").AcceptedPlugin[] }} */
export const config = {
  plugins: [tailwindCss(), ReplaceRootWithNewDesign()],
};

export default config;
