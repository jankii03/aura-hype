/**
 * Script to list all images from Cloudflare R2 bucket using Wrangler
 * 
 * Usage:
 *   npx tsx scripts/list-r2-wrangler.ts
 */

import { execSync } from 'child_process'
import * as fs from 'fs'

interface R2Object {
  key: string
  size: number
  etag: string
  uploaded: string
}

interface Product {
  id: number
  name: string
  price: string
  image: string
}

async function main() {
  console.log('Fetching images from R2 bucket using Wrangler...\n')

  try {
    // Use wrangler to get objects - we'll parse the output
    // Since wrangler r2 object list doesn't exist, we'll use a different approach
    // We'll create a temporary worker script to list all objects
    
    const workerScript = `
export default {
  async fetch(request, env) {
    const allObjects = [];
    let cursor = undefined;
    let truncated = true;
    
    while (truncated) {
      const listed = await env.IMAGES.list({
        cursor,
        limit: 1000,
      });
      
      allObjects.push(...listed.objects.map(obj => ({
        key: obj.key,
        size: obj.size,
        uploaded: obj.uploaded,
      })));
      
      truncated = listed.truncated;
      cursor = listed.cursor;
    }
    
    return new Response(JSON.stringify(allObjects, null, 2), {
      headers: { 'Content-Type': 'application/json' },
    });
  },
};
`
    
    // Write temp worker
    const tempWorkerPath = './scripts/temp-r2-list-worker.js'
    fs.writeFileSync(tempWorkerPath, workerScript)
    
    console.log('Starting temporary worker to list R2 objects...')
    console.log('This will start a local dev server. Please wait...\n')
    
    // Run wrangler dev in the background and fetch from it
    const { spawn } = await import('child_process')
    
    const wrangler = spawn('npx', ['wrangler', 'dev', tempWorkerPath, '--port', '8787', '--local'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true,
    })
    
    let output = ''
    wrangler.stdout?.on('data', (data) => {
      output += data.toString()
    })
    wrangler.stderr?.on('data', (data) => {
      output += data.toString()
    })
    
    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 5000))
    
    // Fetch from the worker
    console.log('Fetching object list from worker...')
    const response = await fetch('http://localhost:8787')
    const objects: R2Object[] = await response.json()
    
    // Kill wrangler
    wrangler.kill()
    
    // Clean up temp file
    fs.unlinkSync(tempWorkerPath)
    
    // Filter for images
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.svg']
    const imageObjects = objects.filter(obj => 
      imageExtensions.some(ext => obj.key.toLowerCase().endsWith(ext))
    )
    
    console.log(`\nFound ${imageObjects.length} images in R2 bucket\n`)
    
    // Generate products array
    const products: Product[] = imageObjects.map((obj, index) => ({
      id: index + 1,
      name: generateProductName(obj.key),
      price: '$0',
      image: obj.key,
    }))
    
    // Generate code snippet
    const codeSnippet = generateCodeSnippet(products)
    
    console.log('='.repeat(80))
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

main()
