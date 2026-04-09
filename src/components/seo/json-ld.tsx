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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: Record<string, any>
}

/**
 * Renders a single JSON-LD block. Can be used multiple times per page
 * to include multiple schema types (Organisation + SoftwareApplication, etc.).
 */
export function JsonLd({ schema }: JsonLdProps) {
  return (
    // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD structured
    // data uses JSON.stringify output — machine-generated, never user input.
    // This is the Next.js-recommended pattern for embedding schema.org scripts.
    // See: https://nextjs.org/docs/app/building-your-application/optimizing/metadata#json-ld
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
