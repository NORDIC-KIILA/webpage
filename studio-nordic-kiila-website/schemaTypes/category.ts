import {TagIcon} from '@sanity/icons/Tag'
import {defineField, defineType} from 'sanity'
import type {ValidationContext} from 'sanity'
import {API_VERSION, ownDocumentIds} from './utils'

export const category = defineType({
  name: 'category',
  title: 'Kategoriat',
  type: 'document',
  icon: TagIcon,
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
      description:
        'Tämä on sivun osoite. Jos muutat sitä, lisää vanha osoite kohtaan Uudelleenohjaukset, jotta vanhat linkit eivät katkea.',
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
      name: 'isOutlet',
      title: 'Outlet-kategoria',
      type: 'boolean',
      description:
        'Valitse tämä vain Outlet-kategorialle. Vain yksi kategoria voi olla Outlet. Outlet-kategoria näkyy valikossa Outlet-linkkinä ja sen tuotteisiin liittyy erillinen yhteydenottolinkki.',
      initialValue: false,
      validation: (Rule) =>
        Rule.custom(async (value: boolean | undefined, context: ValidationContext) => {
          if (value !== true) return true
          const client = context.getClient({apiVersion: API_VERSION})
          const others = await client.fetch(
            `count(*[_type == "category" && isOutlet == true && !(_id in $ids)])`,
            {ids: ownDocumentIds(context)},
          )
          return others > 0
            ? 'Outlet-kategoria on jo olemassa. Poista valinta muualta ennen tallennusta.'
            : true
        }),
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
