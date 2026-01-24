/**
 * Script to list all images from Cloudflare R2 bucket
 * Uses wrangler's authentication (OAuth token)
 * 
 * Usage:
 *   npx tsx scripts/list-r2-simple.ts
 */

import { execSync } from 'child_process'
import * as fs from 'fs'

const BUCKET_NAME = 'aura-hype-listing-images'
const ACCOUNT_ID = 'ee6f27d7da923cc3ded9e64297770057'

interface Product {
  id: number
  name: string
  price: string
  image: string
}

async function getWranglerToken(): Promise<string> {
  // Read the OAuth token from wrangler's config
  const configPath = process.env.APPDATA 
    ? `${process.env.APPDATA}/xdg.config/.wrangler/config/default.toml`
    : `${process.env.HOME}/.wrangler/config/default.toml`
  
  try {
    const config = fs.readFileSync(configPath, 'utf-8')
    const match = config.match(/oauth_token\s*=\s*"([^"]+)"/)
    if (match) {
      return match[1]
    }
  } catch (e) {
    // Try alternate path
    const altPath = `${process.env.USERPROFILE}/.wrangler/config/default.toml`
    try {
      const config = fs.readFileSync(altPath, 'utf-8')
      const match = config.match(/oauth_token\s*=\s*"([^"]+)"/)
      if (match) {
        return match[1]
      }
    } catch (e2) {
      // Ignore
    }
  }
  
  throw new Error('Could not find wrangler OAuth token. Please run: npx wrangler login')
}

async function listR2Objects(token: string): Promise<string[]> {
  const allKeys: string[] = []
  let cursor: string | undefined = undefined
  
  console.log('Fetching objects from R2 bucket...\n')
  
  do {
    const url = new URL(`https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/r2/buckets/${BUCKET_NAME}/objects`)
    if (cursor) {
      url.searchParams.set('cursor', cursor)
    }
    url.searchParams.set('per_page', '1000')
    
    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
    
    if (!response.ok) {
      const text = await response.text()
      throw new Error(`API error: ${response.status} ${text}`)
    }
    
    const data = await response.json() as any
    
    if (data.result?.objects) {
      for (const obj of data.result.objects) {
        allKeys.push(obj.key)
      }
    }
    
    cursor = data.result_info?.cursor
    console.log(`  Fetched ${allKeys.length} objects so far...`)
    
  } while (cursor)
  
  return allKeys
}

function generateProductName(key: string): string {
  const nameWithoutExt = key.replace(/\.[^/.]+$/, '')
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (uuidPattern.test(nameWithoutExt)) {
    return 'Product Name (Update Me)'
  }
  return nameWithoutExt
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase())
}

function generateCodeSnippet(products: Product[]): string {
  const items = products.map(p => `    {
      id: ${p.id},
      name: '${p.name.replace(/'/g, "\\'")}',
      price: '${p.price}',
      image: '${p.image}',
    }`).join(',\n')

  return `const products = [
${items}
  ]`
}

async function main() {
  try {
    console.log('Getting wrangler OAuth token...')
    const token = await getWranglerToken()
    console.log('✅ Found OAuth token\n')
    
    const allKeys = await listR2Objects(token)
    
    // Filter for images
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.svg']
    const imageKeys = allKeys.filter(key => 
      imageExtensions.some(ext => key.toLowerCase().endsWith(ext))
    )
    
    console.log(`\nFound ${imageKeys.length} images in R2 bucket\n`)
    console.log('Image keys:')
    imageKeys.slice(0, 20).forEach((key, i) => console.log(`  ${i + 1}. ${key}`))
    if (imageKeys.length > 20) {
      console.log(`  ... and ${imageKeys.length - 20} more`)
    }
    
    // Generate products array
    const products: Product[] = imageKeys.map((key, index) => ({
      id: index + 1,
      name: generateProductName(key),
      price: '$0',
      image: key,
    }))
    
    // Generate code snippet
    const codeSnippet = generateCodeSnippet(products)
    
    console.log('\n' + '='.repeat(80))
    console.log('COPY-PASTE CODE SNIPPET:')
    console.log('='.repeat(80) + '\n')
    console.log(codeSnippet)
    console.log('\n' + '='.repeat(80))
    
    // Save outputs
    fs.writeFileSync('./scripts/r2-images-output.ts', codeSnippet)
    console.log(`\n✅ Code snippet saved to: ./scripts/r2-images-output.ts`)
    
    fs.writeFileSync('./scripts/r2-images-output.json', JSON.stringify({ total: products.length, products }, null, 2))
    console.log(`✅ JSON data saved to: ./scripts/r2-images-output.json`)
    
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

main()
