import {defineField, defineType} from 'sanity'

export const category = defineType({
  name: 'category',
  title: 'Kategoriat',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'isHidden',
      title: 'Piilota',
      type: 'boolean',
      description: 'Jos valittu, näyttää 404-virheen eikä sivu näy hakukoneissa tai navigaatiossa.',
      initialValue: false,
    }),
    defineField({
      name: 'headerTitle',
      title: 'Sivun otsikko',
      type: 'string',
    }),
    defineField({
      name: 'content',
      title: 'Sivun kuvaus',
      type: 'array',
      of: [{type: 'block'}],
    }),
    defineField({
      name: 'seo',
      title: 'SEO Settings',
      type: 'seo',
    }),
  ],
})
