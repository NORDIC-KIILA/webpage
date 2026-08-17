import {defineField, defineType} from 'sanity'

export const product = defineType({
  name: 'product',
  title: 'Tuotteet',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Nimi',
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
      description: 'Jos valittu, tuote ei näy julkisella puolella.',
      initialValue: false,
    }),
    defineField({
      name: 'category',
      title: 'Kategoria',
      type: 'reference',
      to: [{type: 'category'}],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'measurements',
      title: 'Koot ja nousu',
      type: 'string',
      description: 'Esimerkiksi: "1200 x 600 mm, nousu 1:10"',
    }),
    defineField({
      name: 'summary',
      title: 'Lyhyt kuvaus',
      type: 'array',
      of: [{type: 'block'}],
    }),
    defineField({
      name: 'quickinfo',
      title: 'Pikatiedot',
      type: 'array',
      of: [{type: 'block'}],
    }),
    defineField({
      name: 'gallery',
      title: 'Galleria',
      type: 'object',
      description:
        'Listan ensimmäisestä kuvasta tulee aina pääkuva. Muut mahdolliset kuvat näkyvät pääkuvan alapuolella pikkukuvina (thumbnail).',
      fields: [
        defineField({
          name: 'images',
          title: 'Kuvat',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                defineField({
                  name: 'image',
                  title: 'Kuva',
                  type: 'image',
                  options: {
                    hotspot: true,
                  },
                }),
                defineField({
                  name: 'alt',
                  title: 'Alt-teksti',
                  type: 'string',
                  description: 'Kuvan saavutettavuusteksti',
                }),
              ],
              preview: {
                select: {
                  title: 'alt',
                  media: 'image',
                },
              },
            },
          ],
        }),
      ],
    }),
    defineField({
      name: 'table',
      title: 'Tekniset tiedot',
      type: 'object',
      initialValue: {
        headers: ['Koodi', 'Pituus', 'Leveys', 'Nousu', 'Pinta-ala', 'Tilavuus'],
      },
      fields: [
        defineField({
          name: 'headers',
          title: 'Sarakkeiden otsikot',
          type: 'array',
          of: [{type: 'string'}],
          description: 'Oletusarvot on esitäytetty. Voit muokata, lisätä tai poistaa sarakkeita.',
        }),
        defineField({
          name: 'rows',
          title: 'Taulukon rivit',
          type: 'array',
          of: [
            {
              type: 'object',
              name: 'tableRow',
              fields: [
                defineField({
                  name: 'cells',
                  title: 'Sarakkeiden arvot',
                  type: 'array',
                  of: [{type: 'string'}],
                  description:
                    'Täytä rivin arvot. Varmista, että sarakkeiden määrä vastaa yllä olevia otsikoita.',
                }),
              ],
              preview: {
                select: {
                  c1: 'cells.0',
                  c2: 'cells.1',
                },
                prepare({c1, c2}) {
                  return {
                    title: c1 || 'Uusi rivi',
                    subtitle: c2 || '',
                  }
                },
              },
            },
          ],
        }),
      ],
    }),
    defineField({
      name: 'documents',
      title: 'Dokumentit',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Nimi',
              type: 'string',
              description: 'Esimerkiksi: "Asennusohje.pdf"',
            }),
            defineField({
              name: 'file',
              title: 'Tiedosto',
              type: 'file',
            }),
          ],
          preview: {
            select: {
              title: 'title',
              media: 'file',
            },
          },
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      categoryTitle: 'category.title',
      isHidden: 'isHidden',
      media: 'gallery.images.0.image',
    },
    prepare({title, categoryTitle, isHidden, media}) {
      const visibility = isHidden ? 'Piilotettu' : 'Julkinen'
      return {
        title: title || 'Nimetön tuote',
        subtitle: [visibility, categoryTitle].filter(Boolean).join(' · '),
        media,
      }
    },
  },
})
