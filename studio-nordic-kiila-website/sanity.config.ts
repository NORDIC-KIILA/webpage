import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {dashboardTool} from '@sanity/dashboard'
import {netlifyWidget} from 'sanity-plugin-dashboard-widget-netlify'

export default defineConfig({
  name: 'default',
  title: 'Nordic Kiila website',

  projectId: 'lgimtaiv',
  dataset: 'production',

  plugins: [
    structureTool(),
    visionTool(),
    dashboardTool({
      widgets: [
        netlifyWidget({
          title: 'Netlify deploys',
          sites: [
            {
              title: 'Nordic Kiila Website',
              apiId: process.env.SANITY_STUDIO_NETLIFY_API_ID ?? '',
              buildHookId: process.env.SANITY_STUDIO_NETLIFY_BUILD_HOOK_ID ?? '',
              name: process.env.SANITY_STUDIO_NETLIFY_SITE_NAME ?? '',
              url: 'https://nordickiila.fi',
              branch: 'main',
            },
          ],
        }),
      ],
    }),
  ],

  schema: {
    types: schemaTypes,
  },
})
