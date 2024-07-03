/** @type {import('postcss-load-config').Config} */
const isProduction = process.env.NODE_ENV === 'production';

const basePlugins = {
  'postcss-import': {},
  'tailwindcss/nesting': {},
  tailwindcss: {},
  autoprefixer: {
    flexbox: 'no-2009',
  },
};

const productionPlugins = {
  cssnano: {
    preset: [
      'default',
      {
        discardComments: { removeAll: true },
        normalizeWhitespace: true,
      },
    ],
  },
};

const plugins = isProduction
  ? { ...basePlugins, ...productionPlugins }
  : basePlugins;

module.exports = { plugins };
