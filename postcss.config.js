// postcss.config.js
const nesting = require('postcss-nesting');
const tailwind = require('@tailwindcss/postcss');
const autoprefixer = require('autoprefixer');

// 👇 Compatible plugin that rewrites `.tw-scope :root` to `.tw-scope`
function fixTailwindRootScope() {
  return {
    postcssPlugin: 'fix-tailwind-root-scope',
    OnceExit(root) {
      root.walkRules((rule) => {
        if (
          rule.selector &&
          rule.selector.includes('.tw-scope') &&
          rule.selector.includes(':root')
        ) {
          rule.selector = rule.selector.replace(/:root/g, '').trim();
        }
      });
    },
  };
}

module.exports = {
  plugins: [
    nesting,
    tailwind,
    autoprefixer,
    fixTailwindRootScope(),
  ],
};