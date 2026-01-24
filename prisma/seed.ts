import { PrismaClient } from '../src/generated/prisma/client.js'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clear existing todos
  await prisma.todo.deleteMany()

  // Create example todos
  const todos = await prisma.todo.createMany({
    data: [
      { title: 'Buy groceries' },
      { title: 'Read a book' },
      { title: 'Workout' },
    ],
  })

  console.log(`✅ Created ${todos.count} todos`)

  // Clear existing products
  await prisma.product.deleteMany()

  // Create products
  const products = await prisma.product.createMany({
    data: [
      // Louis Vuitton
      { name: 'LV Trainer Sneaker', price: '$1,150', image: 'lv-trainer.jpg', brand: 'louis-vuitton', category: 'luxury' },
      { name: 'LV Archlight Sneaker', price: '$1,200', image: 'lv-archlight.jpg', brand: 'louis-vuitton', category: 'luxury' },
      // Balenciaga
      { name: 'Balenciaga Triple S', price: '$950', image: 'balenciaga-triple-s.jpg', brand: 'balenciaga', category: 'luxury' },
      { name: 'Balenciaga Track', price: '$895', image: 'balenciaga-track.jpg', brand: 'balenciaga', category: 'luxury' },
      // Gucci
      { name: 'Gucci Ace', price: '$650', image: 'gucci-ace.jpg', brand: 'gucci', category: 'luxury' },
      { name: 'Gucci Rhyton', price: '$890', image: 'gucci-rhyton.jpg', brand: 'gucci', category: 'luxury' },
      // Dior
      { name: 'Dior B23', price: '$1,100', image: 'dior-b23.jpg', brand: 'dior', category: 'luxury' },
      { name: 'Dior B27', price: '$950', image: 'dior-b27.jpg', brand: 'dior', category: 'luxury' },
      // Prada
      { name: 'Prada Cloudbust', price: '$850', image: 'prada-cloudbust.jpg', brand: 'prada', category: 'luxury' },
      { name: 'Prada America\'s Cup', price: '$750', image: 'prada-americas-cup.jpg', brand: 'prada', category: 'luxury' },
      // Amiri
      { name: 'Amiri Skel Top', price: '$495', image: 'amiri-skel-top.jpg', brand: 'amiri', category: 'luxury' },
      { name: 'Amiri Bone Runner', price: '$550', image: 'amiri-bone-runner.jpg', brand: 'amiri', category: 'luxury' },
      // BAPE
      { name: 'BAPE Sta', price: '$275', image: 'bape-sta.jpg', brand: 'bape', category: 'luxury' },
      { name: 'BAPE Sk8 Sta', price: '$295', image: 'bape-sk8-sta.jpg', brand: 'bape', category: 'luxury' },
      // Dolce & Gabbana
      { name: 'D&G Portofino', price: '$575', image: 'dg-portofino.jpg', brand: 'dolce-gabana', category: 'luxury' },
      { name: 'D&G Sorrento', price: '$695', image: 'dg-sorrento.jpg', brand: 'dolce-gabana', category: 'luxury' },
      // Nike
      { name: 'Nike Air Max 90', price: '$130', image: 'nike-air-max-90.jpg', brand: 'nike', category: 'sneakers' },
      { name: 'Nike Dunk Low', price: '$110', image: 'nike-dunk-low.jpg', brand: 'nike', category: 'sneakers' },
      // Jordan
      { name: 'Air Jordan 1', price: '$170', image: 'jordan-1.jpg', brand: 'jordan', category: 'sneakers' },
      { name: 'Air Jordan 4', price: '$210', image: 'jordan-4.jpg', brand: 'jordan', category: 'sneakers' },
      // Asics
      { name: 'Asics Gel-Lyte III', price: '$130', image: 'asics-gel-lyte.jpg', brand: 'asics', category: 'sneakers' },
      { name: 'Asics Gel-Kayano', price: '$160', image: 'asics-gel-kayano.jpg', brand: 'asics', category: 'sneakers' },
      // New Balance
      { name: 'New Balance 550', price: '$120', image: 'nb-550.jpg', brand: 'new-balance', category: 'sneakers' },
      { name: 'New Balance 990v6', price: '$185', image: 'nb-990v6.jpg', brand: 'new-balance', category: 'sneakers' },
    ],
  })

  console.log(`✅ Created ${products.count} products`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
