const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  transpileDependencies: true,
  
  // Configure proxy for dev server
  devServer: {
    proxy: {
      '/api': {
        target: process.env.VUE_APP_API_URL || 'http://localhost:5000',
        changeOrigin: true
      }
    }
  },
  
  // Configure Webpack
  configureWebpack: {
    performance: {
      hints: process.env.NODE_ENV === 'production' ? 'warning' : false,
      maxAssetSize: 512000, // Increase size limit for assets
      maxEntrypointSize: 512000 // Increase size limit for entrypoints
    }
  },
  
  // Configure CSS and TailwindCSS
  css: {
    loaderOptions: {
      sass: {
        additionalData: `
          @import "@/assets/scss/variables.scss";
        `
      }
    }
  },
  
  // PWA settings - Uncomment for PWA support
  // pwa: {
  //   name: 'ObjectDetectAI',
  //   themeColor: '#3B82F6',
  //   msTileColor: '#3B82F6',
  //   appleMobileWebAppCapable: 'yes',
  //   appleMobileWebAppStatusBarStyle: 'black-translucent',
  //   workboxOptions: {
  //     skipWaiting: true
  //   }
  // },
  
  // Configure Vuetify loader
  pluginOptions: {
    vuetify: {
      // https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vuetify-loader
    }
  }
}); 