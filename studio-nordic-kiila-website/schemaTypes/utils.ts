import type {ValidationContext} from 'sanity'

export const API_VERSION = '2024-01-01'

/**
 * IDs of the document being edited, both draft and published. Used so a
 * document is never counted as a conflict with itself.
 */
export function ownDocumentIds(context: ValidationContext): string[] {
  const id = String(context.document?._id ?? '').replace(/^drafts\./, '')
  return [id, `drafts.${id}`]
}
