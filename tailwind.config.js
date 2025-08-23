// tailwind.config.js - Disabled in favor of Policy Radar CSS
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"], // Valid content to prevent warnings
  corePlugins: false, // Disable all Tailwind core plugins
  theme: {
    extend: {},
  },
};