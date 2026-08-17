import {defineField, defineType} from 'sanity'

export const seo = defineType({
  name: 'seo',
  title: 'SEO Settings',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Meta Title',
      type: 'string',
      description: 'Korvaa sivun oletusotsikon. Suositus: 50–60 merkkiä.',
    }),
    defineField({
      name: 'description',
      title: 'Meta Description',
      type: 'text',
      rows: 3,
      description: 'Yhteenveto hakukoneille. Suositus: 150–160 merkkiä.',
    }),
    defineField({
      name: 'image',
      title: 'Social Sharing Image',
      type: 'image',
      description: 'Suositeltu koko: 1200x630 px.',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'noIndex',
      title: 'Prevent search engines from indexing',
      type: 'boolean',
      description: 'Valitse tämä, jos et halua hakukoneiden indeksoivan sivua.',
      initialValue: false,
    }),
  ],
})
