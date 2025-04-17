/** @type {import('postcss-load-config').Config} */
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Base PostCSS plugins applied in every environment.
 * Order matters: imports must be inlined before Tailwind nesting/expansion,
 * and autoprefixer should run last so it sees the final declarations.
 */
const basePlugins = {
  'postcss-import': {},
  'tailwindcss/nesting': {},
  tailwindcss: {},
  autoprefixer: {
    flexbox: 'no-2009',
    grid: 'autoplace',
  },
};

/**
 * Production-only minification plugins. Kept separate so dev builds stay fast
 * and source maps remain readable.
 */
const productionPlugins = {
  cssnano: {
    preset: [
      'default',
      {
        discardComments: { removeAll: true },
        normalizeWhitespace: true,
        mergeLonghand: true,
        colormin: true,
      },
    ],
  },
};

function resolvePlugins(env) {
  switch (env) {
    // In test environments we skip Tailwind/autoprefixer entirely to keep
    // snapshot output deterministic and avoid pulling in browserslist data.
    case 'test':
      return { 'postcss-import': {} };
    case 'production':
      return { ...basePlugins, ...productionPlugins };
    default:
      return basePlugins;
  }
}

module.exports = { plugins: resolvePlugins(NODE_ENV) };
