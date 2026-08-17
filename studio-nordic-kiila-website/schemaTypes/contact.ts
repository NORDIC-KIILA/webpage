import {defineField, defineType} from 'sanity'

export const contact = defineType({
  name: 'contact',
  title: 'Yhteyshenkilöt',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Nimi',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'jobtitle',
      title: 'Työnimike',
      type: 'string',
    }),
    defineField({
      name: 'email',
      title: 'Sähköposti',
      type: 'string',
    }),
    defineField({
      name: 'phone',
      title: 'Puhelin',
      type: 'string',
    }),
    defineField({
      name: 'order',
      title: 'Järjestys',
      type: 'number',
      description: 'Pienempi numero näkyy ensin. Esim. 1, 2, 3…',
      initialValue: 0,
    }),
    defineField({
      name: 'isHidden',
      title: 'Piilota',
      type: 'boolean',
      description: 'Jos valittu, yhteyshenkilö piilotetaan sivuilta.',
      initialValue: false,
    }),
  ],
  orderings: [
    {
      title: 'Järjestys',
      name: 'orderAsc',
      by: [{field: 'order', direction: 'asc'}],
    },
    {
      title: 'Nimi',
      name: 'nameAsc',
      by: [{field: 'name', direction: 'asc'}],
    },
  ],
})
