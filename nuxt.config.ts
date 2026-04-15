// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  app: {
    baseURL: '/invoice-generator/',
    head: {
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/invoice-generator/favicon.svg' },
        { rel: 'icon', type: 'image/x-icon', href: '/invoice-generator/favicon.ico' },
      ],
    },
  },
  devServer: {
    port: 3001
  }
})
