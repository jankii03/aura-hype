/**
 * Standalone Cloudflare Worker to list R2 bucket objects
 * Deploy this temporarily to get the list of all images
 * 
 * Usage:
 *   npx wrangler deploy scripts/r2-list-worker.ts --name r2-list-temp
 *   curl https://r2-list-temp.<your-subdomain>.workers.dev
 *   npx wrangler delete r2-list-temp
 */

export interface Env {
  IMAGES: R2Bucket
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const allObjects: { key: string; size: number; uploaded: Date }[] = []
    let cursor: string | undefined = undefined
    let truncated = true

    while (truncated) {
      const listed = await env.IMAGES.list({
        cursor,
        limit: 1000,
      })

      for (const obj of listed.objects) {
        allObjects.push({
          key: obj.key,
          size: obj.size,
          uploaded: obj.uploaded,
        })
      }

      truncated = listed.truncated
      cursor = listed.cursor
    }

    // Filter for image files
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.svg']
    const imageObjects = allObjects.filter(obj =>
      imageExtensions.some(ext => obj.key.toLowerCase().endsWith(ext))
    )

    // Generate products array
    const products = imageObjects.map((obj, index) => ({
      id: index + 1,
      name: generateProductName(obj.key),
      price: '$0',
      image: obj.key,
    }))

    // Generate code snippet
    const codeSnippet = generateCodeSnippet(products)

    return new Response(
      JSON.stringify(
        {
          total: products.length,
          products,
          codeSnippet,
        },
        null,
        2
      ),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    )
  },
}

function generateProductName(key: string): string {
  const nameWithoutExt = key.replace(/\.[^/.]+$/, '')
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (uuidPattern.test(nameWithoutExt)) {
    return 'Product Name (Update Me)'
  }
  return nameWithoutExt.replace(/[-_]/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}

function generateCodeSnippet(
  products: Array<{ id: number; name: string; price: string; image: string }>
): string {
  const items = products
    .map(
      (p) => `    {
      id: ${p.id},
      name: '${p.name.replace(/'/g, "\\'")}',
      price: '${p.price}',
      image: '${p.image}',
    }`
    )
    .join(',\n')

  return `const products = [
${items}
  ]`
}
