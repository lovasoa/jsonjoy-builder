// @ts-check

import tailwindCss from "@tailwindcss/postcss";

const AllowedAtRules = new Set(["media", "supports", "layer"]);

// tailwind is not suitable for libraries in general, so we use a plugin
// to add proper scoping to the generated CSS.
//
// Also, see  https://github.com/tailwindlabs/tailwindcss/discussions/18108
// Tailwind always uses :root / :host, but we want to scope it to .jsonjoy
/** @type {() => import("postcss").Plugin} */
const CssScopingPlugin = () => {
  return {
    postcssPlugin: 'replace-root-with-new_design',
    Once(root) {
      root.walkRules(rule => {
        if (rule.parent?.type === "atrule" && !AllowedAtRules.has(rule.parent.name)) {
          return;
        }
        const newSelectors = new Set();
        for (const selector of rule.selectors) {
          // Replace :root and :host with .jsonjoy
          if (selector === ":root" || selector === ":host" ) {
            newSelectors.add(".jsonjoy");
          }
          // Scope universal selector
          else if (selector === "*") {
            newSelectors.add(".jsonjoy");
            newSelectors.add(".jsonjoy *");
          }
          // Prefix all other selectors with .jsonjoy, if not already prefixed
          else if (!selector.startsWith(".jsonjoy")) {
            newSelectors.add(`.jsonjoy ${selector}`);
            newSelectors.add(addClassSelectorScope("jsonjoy", selector));
          } else {
            newSelectors.add(selector);
          }
        }
        rule.selectors = [...newSelectors];
      });

      // Prefix built-in animation names from tailwind with jsonjoy-
      // See https://tailwindcss.com/docs/animation
      root.walkRules(rule => {
        for (const node of rule.nodes) {
          if (node.type === "decl" && node.variable) {
            const animateMatch = /--animate-([a-zA-Z0-9_-]+)/.exec(node.prop);
            if (animateMatch) {
                const animationName = animateMatch[1];
                node.value = node.value.replace(new RegExp(`\\b${animationName}\\b`, "g"), `jsonjoy-${animationName}`);
            }
          }
        }
      });

      // Prefix built-in keyframe names from tailwind with jsonjoy-
      // See https://tailwindcss.com/docs/animation
      root.walkAtRules(atRule => {
        if (atRule.name === "keyframes" && !atRule.params.startsWith("jsonjoy-")) {
          atRule.params = `jsonjoy-${atRule.params}`;
        }
      });
    }
  };
};

/**
 * Adds the class name as a scope to the selector.
 * - table foo => table.jsonjoy foo
 * - .foo .bar => .jsonjoy.foo .bar
 * - [data-attr="foo bar"] baz => .jsonjoy[data-attr="foo bar"] baz
 * - :is(.foo, .bar) baz => .jsonjoy:is(.foo, .bar) baz
 * @param {string} className 
 * @param {string} selector 
 */
function addClassSelectorScope(className, selector) {
  // Class name, ID, or attribute selector
  if (selector.startsWith(".") || selector.startsWith("#") || selector.startsWith("[")) {
    return `.${className}${selector}`;
  }

  // Pseudo-class or pseudo-element
  if (selector.startsWith(":")) {
    return `.${className}${selector}`;
  }

  // Tag name
  const match = selector.match(/^([a-zA-Z0-9_-]+)/);
  if (match) {
    const tagName = match[1];
    return `${tagName}.${className}${selector.substring(tagName.length)}`;
  }

  return selector;

}

/** @type {{plugins:import("postcss").AcceptedPlugin[] }} */
export const config = {
  plugins: [tailwindCss(), CssScopingPlugin()],
};

export default config;
