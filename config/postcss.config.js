// @ts-check

import tailwindCss from "@tailwindcss/postcss";

// At-Rules that contain selectors that we want to scope
const AllowedAtRules = new Set(["media", "supports", "layer"]);

// tailwind is not suitable for libraries in general, so we use a plugin
// to add proper scoping to the generated CSS.
/** @type {() => import("postcss").Plugin} */
const cssScopingPlugin = () => {
  return {
    postcssPlugin: 'replace-root-with-new_design',
    Once(root) {
      // Add .jsonjoy class selector to all selectors
      root.walkRules(rule => {
        if (rule.parent?.type === "atrule" && !AllowedAtRules.has(rule.parent.name)) {
          return;
        }
        const newSelectors = new Set();
        for (const selector of rule.selectors) {
          // See  https://github.com/tailwindlabs/tailwindcss/discussions/18108
          // Tailwind always uses :root / :host, but we want to scope it to .jsonjoy
          // Replace :root and :host with .jsonjoy
          if (selector === ":root" || selector === ":host") {
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
          }
          // Already prefixed, so do nothing
          else {
            newSelectors.add(selector);
          }
        }
        rule.selectors = [...newSelectors];
      });

      // Prefix built-in animation names from tailwind with jsonjoy-
      // See https://tailwindcss.com/docs/animation
      root.walkDecls(decl => {
        if (decl.variable) {
          const animateMatch = /--animate-([a-zA-Z0-9_-]+)/.exec(decl.prop);
          if (animateMatch) {
            const animationName = animateMatch[1];
            decl.value = decl.value.replace(new RegExp(`\\b${animationName}\\b`, "g"), `jsonjoy-${animationName}`);
          }
        }
      });

      // Prefix @layer with jsonjoy-
      root.walkAtRules(atRule => {
        if (atRule.name === "layer" && !atRule.params.startsWith("jsonjoy-")) {
          atRule.params = `jsonjoy-${atRule.params}`;
        }
      });

      // Prefix built-in keyframe names from tailwind with jsonjoy-
      // See https://tailwindcss.com/docs/animation
      root.walkAtRules(atRule => {
        if (atRule.name === "keyframes" && !atRule.params.startsWith("jsonjoy-")) {
          atRule.params = `jsonjoy-${atRule.params}`;
        }
      });

      // Prefix CSS custom properties with jsonjoy-
      root.walkDecls(decl => {
        if (decl.variable && !decl.prop.startsWith("--jsonjoy-")) {
          decl.prop = `--jsonjoy-${decl.prop.substring(2)}`;
        }
      });

      // Prefix usages of CSS custom properties [var(--name)] with jsonjoy-
      root.walkDecls(decl => {
        decl.value = decl.value.replace(/var\(--([a-zA-Z0-9_\-]+)/g, (match, name) => {
          return name.startsWith("jsonjoy-") ? match : `var(--jsonjoy-${name}`;
        });
      });

      // Prefix custom @property rules with jsonjoy-
      root.walkAtRules(atRule => {
        if (atRule.name === "property" && !atRule.params.startsWith("--jsonjoy-")) {
          atRule.params = `--jsonjoy-${atRule.params.substring(2)}`;
        }
      });
    }
  };
};

/**
 * Adds the class name as a scope to the selector.
 * 
 * - `table foo` => `table.jsonjoy foo`
 * - `#foo .bar` => `.jsonjoy#foo .bar`
 * - `.foo .bar` => `.jsonjoy.foo .bar`
 * - `[data-attr="foo bar"] baz` => `.jsonjoy[data-attr="foo bar"] baz`
 * - `:is(.foo, .bar) baz` => `.jsonjoy:is(.foo, .bar) baz`
 * @param {string} className 
 * @param {string} selector 
 */
function addClassSelectorScope(className, selector) {
  // ID selector, class selector, attribute selector or pseudo-class / pseudo-element
  if (selector.startsWith(".") || selector.startsWith("#") || selector.startsWith("[") || selector.startsWith(":")) {
    return `.${className}${selector}`;
  }

  // Tag name
  // Note that for tag names, the class selector must be inserted after the tag name,
  // as in `table.jsonjoy` instead of `.jsonjoytable`.
  const match = selector.match(/^([a-zA-Z0-9_-]+)/);
  if (match) {
    const tagName = match[1];
    return `${tagName}.${className}${selector.substring(tagName.length)}`;
  }

  return selector;

}

/** @type {{plugins:import("postcss").AcceptedPlugin[] }} */
export const config = {
  plugins: [tailwindCss(), cssScopingPlugin()],
};

export default config;
