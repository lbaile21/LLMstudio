/** @type {import('postcss-load-config').Config} */
const isProduction = process.env.NODE_ENV === 'production';

const plugins = {
  'postcss-import': {},
  'tailwindcss/nesting': {},
  tailwindcss: {},
  autoprefixer: {
    flexbox: 'no-2009',
  },
};

if (isProduction) {
  plugins.cssnano = {
    preset: [
      'default',
      {
        discardComments: { removeAll: true },
        normalizeWhitespace: true,
      },
    ],
  };
}

module.exports = { plugins };
