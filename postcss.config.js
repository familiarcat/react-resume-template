/* eslint-env node */

module.exports = {
  plugins: {
    'postcss-nesting': {},
    tailwindcss: {},
    autoprefixer: {},
    ...(process.env.NODE_ENV === 'production' ? {cssnano: {}} : {})
  }
}
