module.exports = {
  // Use the official PostCSS adapter for Tailwind
  // See https://tailwindcss.com/docs/installation/postcss
  plugins: [
    require('@tailwindcss/postcss'),
    require('autoprefixer'),
  ],
}
