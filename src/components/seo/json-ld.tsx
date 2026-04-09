/**
 * JSON-LD structured data component.
 *
 * Renders a <script type="application/ld+json"> tag for search engine
 * rich result eligibility. All schemas follow schema.org vocabulary.
 *
 * Usage:
 *   import { JsonLd } from '@/components/seo/json-ld'
 *   <JsonLd schema={organizationSchema} />
 */

interface JsonLdProps {
  schema: Record<string, unknown>
}

/**
 * Renders a single JSON-LD block. Can be used multiple times per page
 * to include multiple schema types (Organisation + SoftwareApplication, etc.).
 */
export function JsonLd({ schema }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
