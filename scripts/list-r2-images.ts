/**
 * Script to list all images from Cloudflare R2 bucket
 * 
 * Prerequisites:
 * 1. Create an R2 API token at: https://dash.cloudflare.com/ -> R2 -> Manage R2 API Tokens
 * 2. Set environment variables or update the values below
 * 
 * Usage:
 *   npx tsx scripts/list-r2-images.ts
 * 
 * Or with environment variables:
 *   CLOUDFLARE_ACCOUNT_ID=xxx R2_ACCESS_KEY_ID=xxx R2_SECRET_ACCESS_KEY=xxx npx tsx scripts/list-r2-images.ts
 */

import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3'
import * as fs from 'fs'

// Configuration - Update these or use environment variables
const config = {
  accountId: process.env.CLOUDFLARE_ACCOUNT_ID || 'ee6f27d7da923cc3ded9e64297770057',
  accessKeyId: process.env.R2_ACCESS_KEY_ID || 'b9a14dca4b1c36c898d02e8c81471d72',
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '0b92e4c2e6d83a676c62a6de36e153ce411c12dc3d16afec7e1f4fe5abd723e1',
  bucketName: 'aura-hype-listing-images', // From your wrangler.toml
}

// Create S3 client configured for Cloudflare R2
const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
  },
})

interface Product {
  id: number
  name: string
  price: string
  image: string
}

async function listAllImages(): Promise<string[]> {
  const allKeys: string[] = []
  let continuationToken: string | undefined = undefined

  console.log('Fetching images from R2 bucket...\n')

  do {
    const command = new ListObjectsV2Command({
      Bucket: config.bucketName,
      ContinuationToken: continuationToken,
      MaxKeys: 1000,
    })

    const response = await s3Client.send(command)
    
    if (response.Contents) {
      for (const object of response.Contents) {
        if (object.Key) {
          // Filter for image files
          const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.svg']
          if (imageExtensions.some(ext => object.Key!.toLowerCase().endsWith(ext))) {
            allKeys.push(object.Key)
          }
        }
      }
    }

    continuationToken = response.NextContinuationToken
  } while (continuationToken)

  return allKeys
}

function generateProductName(key: string): string {
  // Remove file extension
  const nameWithoutExt = key.replace(/\.[^/.]+$/, '')
  
  // If it's a UUID-style name, return a placeholder
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (uuidPattern.test(nameWithoutExt)) {
    return 'Product Name (Update Me)'
  }
  
  // Convert kebab-case or snake_case to Title Case
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

  return `const louisVuittonProducts = [
${items}
  ]`
}

async function main() {
  try {
    // Validate configuration
    if (config.accountId === 'YOUR_ACCOUNT_ID' || 
        config.accessKeyId === 'YOUR_R2_ACCESS_KEY_ID' ||
        config.secretAccessKey === 'YOUR_R2_SECRET_ACCESS_KEY') {
      console.error('❌ Please configure your Cloudflare R2 credentials!')
      console.error('')
      console.error('Option 1: Set environment variables:')
      console.error('  $env:CLOUDFLARE_ACCOUNT_ID = "your-account-id"')
      console.error('  $env:R2_ACCESS_KEY_ID = "your-access-key-id"')
      console.error('  $env:R2_SECRET_ACCESS_KEY = "your-secret-access-key"')
      console.error('')
      console.error('Option 2: Edit the config in this file directly')
      console.error('')
      console.error('To get R2 API credentials:')
      console.error('  1. Go to https://dash.cloudflare.com/')
      console.error('  2. Navigate to R2 -> Manage R2 API Tokens')
      console.error('  3. Create a new API token with "Object Read" permission')
      console.error('')
      console.error('Your Account ID can be found in the Cloudflare dashboard URL or R2 overview page')
      process.exit(1)
    }

    const imageKeys = await listAllImages()
    
    console.log(`Found ${imageKeys.length} images in R2 bucket\n`)
    console.log('Image keys:')
    imageKeys.forEach((key, i) => console.log(`  ${i + 1}. ${key}`))
    
    // Generate products array
    const products: Product[] = imageKeys.map((key, index) => ({
      id: index + 1,
      name: generateProductName(key),
      price: '$0',
      image: key,
    }))

    // Generate the code snippet
    const codeSnippet = generateCodeSnippet(products)
    
    console.log('\n' + '='.repeat(80))
    console.log('COPY-PASTE CODE SNIPPET:')
    console.log('='.repeat(80) + '\n')
    console.log(codeSnippet)
    console.log('\n' + '='.repeat(80))

    // Save to file
    const outputPath = './scripts/r2-images-output.ts'
    fs.writeFileSync(outputPath, codeSnippet)
    console.log(`\n✅ Code snippet saved to: ${outputPath}`)

    // Also save JSON for reference
    const jsonOutputPath = './scripts/r2-images-output.json'
    fs.writeFileSync(jsonOutputPath, JSON.stringify({ total: products.length, products }, null, 2))
    console.log(`✅ JSON data saved to: ${jsonOutputPath}`)

  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

main()
