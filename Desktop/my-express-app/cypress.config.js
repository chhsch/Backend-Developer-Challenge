const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    // 注意這裡沒有 setupNodeEvents 函數，specPattern 直接定義在 e2e 對象中
    specPattern: 'cypress/integration/**/*.spec.js',
  },
});


