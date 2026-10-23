import {DocumentsIcon} from '@sanity/icons/Documents'
import {defineField, defineType} from 'sanity'

export const page = defineType({
  name: 'page',
  title: 'Sivut',
  type: 'document',
  icon: DocumentsIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Sivun nimi',
      type: 'string',
      description: 'Näkyy vain Sanityssa. Sivun varsinainen otsikko on koodissa.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Tunniste',
      type: 'slug',
      description:
        'Tekninen tunniste, jolla staattinen sivu hakee SEO-tiedot. Käytä arvoja etusivu, suunnittelupalvelu tai yhteystiedot. Älä muuta olemassa olevaa tunnistetta, muuten sivun SEO ei enää löydy.',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'seo',
      title: 'SEO Settings',
      type: 'seo',
    }),
  ],
  preview: {
    select: {title: 'title', slug: 'slug.current'},
    prepare({title, slug}) {
      return {
        title: title || 'Nimetön sivu',
        subtitle: slug ? `/${slug}` : 'Ei tunnistetta',
      }
    },
  },
})
