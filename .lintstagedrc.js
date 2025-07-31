module.exports = {
  "src/**/*.{js,ts,jsx,tsx}": [
    "eslint --fix --max-warnings=0",
    "prettier --write"
  ],
  "src/**/*.{css,scss}": [
    "prettier --write"
  ],
  "sdk/**/*.{js,ts,jsx,tsx}": [
    "eslint --fix --max-warnings=0",
    "prettier --write"
  ]
}; 