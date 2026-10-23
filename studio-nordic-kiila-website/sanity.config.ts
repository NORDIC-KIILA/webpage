import {defineConfig} from 'sanity'
import {structureTool, type StructureResolver} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {dashboardTool} from '@sanity/dashboard'
import {netlifyWidget} from 'sanity-plugin-dashboard-widget-netlify'
import {LinkIcon} from '@sanity/icons/Link'
import {DocumentsIcon} from '@sanity/icons/Documents'

const structure: StructureResolver = (S) =>
  S.list()
    .title('Sisältö')
    .items([
      S.documentTypeListItem('page').title('Sivut').icon(DocumentsIcon),
      S.divider(),
      S.documentTypeListItem('category').title('Kategoriat'),
      S.documentTypeListItem('product').title('Tuotteet'),
      S.documentTypeListItem('contact').title('Yhteyshenkilöt'),
      S.divider(),
      S.listItem()
        .title('Uudelleenohjaukset')
        .icon(LinkIcon)
        .child(
          S.documentTypeList('redirect')
            .title('Uudelleenohjaukset')
            .defaultOrdering([{field: 'from', direction: 'asc'}]),
        ),
    ])

export default defineConfig({
  name: 'default',
  title: 'Nordic Kiila website',

  projectId: 'lgimtaiv',
  dataset: 'production',

  plugins: [
    structureTool({structure}),
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
