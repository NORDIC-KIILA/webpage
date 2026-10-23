import {LinkIcon} from '@sanity/icons/Link'
import {defineField, defineType} from 'sanity'
import type {ValidationContext} from 'sanity'
import {API_VERSION, ownDocumentIds} from './utils'

const PATH_ERROR = 'Osoitteen pitää alkaa merkillä / (esim. /kategoria/nimi)'

// Returns an error message for an invalid path, or undefined when it is valid.
const pathFormatError = (value: string): string | undefined =>
  value.startsWith('/') && !/\s/.test(value) ? undefined : PATH_ERROR

export const redirect = defineType({
  name: 'redirect',
  title: 'Uudelleenohjaukset',
  type: 'document',
  icon: LinkIcon,
  description:
    'Ohjaa vanhan osoitteen uuteen. Muutokset näkyvät sivustolla vasta, kun sivusto on julkaistu Netlifyyn (Deploy-painike).',
  fields: [
    defineField({
      name: 'from',
      title: 'Vanha osoite',
      type: 'string',
      description: 'Esim. /kategoria/vanha-nimi',
      validation: (Rule) =>
        Rule.required().custom(async (from: string | undefined, context: ValidationContext) => {
          if (!from) return true
          const formatError = pathFormatError(from)
          if (formatError) return formatError
          const client = context.getClient({apiVersion: API_VERSION})

          const duplicates = await client.fetch(
            `count(*[_type == "redirect" && from == $from && !(_id in $ids)])`,
            {from, ids: ownDocumentIds(context)},
          )
          if (duplicates > 0) {
            return 'Tälle vanhalle osoitteelle on jo olemassa uudelleenohjaus'
          }

          // A real page at this address is served before _redirects rules, so
          // the redirect would have no effect. Hidden categories still get a
          // page (the 404 layout), but hidden products get no page at all.
          const livePages = await client.fetch(
            `count(*[(_type == "category" && ("/kategoria/" + slug.current) == $from) || (_type == "product" && isHidden != true && ("/tuotteet/" + slug.current) == $from)])`,
            {from},
          )
          if (livePages > 0) {
            return 'Tällä osoitteella on vielä oma sivu, joten ohjaus ei toimisi. Muuta ensin sivun slug, jotta vanha osoite vapautuu.'
          }
          return true
        }),
    }),
    defineField({
      name: 'to',
      title: 'Uusi osoite',
      type: 'string',
      description: 'Esim. /kategoria/uusi-nimi',
      validation: (Rule) =>
        Rule.required().custom(async (to: string | undefined, context: ValidationContext) => {
          if (!to) return true
          const formatError = pathFormatError(to)
          if (formatError) return formatError
          const from = (context.document?.from as string | undefined) ?? ''
          if (to === from) {
            return 'Vanha ja uusi osoite eivät voi olla samat'
          }
          const client = context.getClient({apiVersion: API_VERSION})

          // Redirect chains do not resolve in _redirects, so reject a target
          // that is itself redirected elsewhere.
          const chained = await client.fetch(
            `count(*[_type == "redirect" && from == $to && !(_id in $ids)])`,
            {to, ids: ownDocumentIds(context)},
          )
          if (chained > 0) {
            return 'Uusi osoite ohjataan itse toiseen osoitteeseen, eikä ohjausketju toimi. Osoita suoraan lopulliseen osoitteeseen.'
          }
          return true
        }),
    }),
    defineField({
      name: 'permanent',
      title: 'Pysyvä ohjaus (301)',
      type: 'boolean',
      description: 'Valitse oletuksena. Poista valinta vain tilapäisille ohjauksille (302).',
      initialValue: true,
    }),
  ],
  preview: {
    select: {from: 'from', to: 'to'},
    prepare({from, to}) {
      return {
        title: from || 'Ei vanhaa osoitetta',
        subtitle: to ? `→ ${to}` : 'Ei uutta osoitetta',
      }
    },
  },
})
