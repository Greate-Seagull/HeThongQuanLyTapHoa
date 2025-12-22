import { PrismaClient } from '../src/generated/client';

const prisma = new PrismaClient();

async function seedSlotDetails() {
  console.log('🌱 Seeding SlotDetails...');
  
  // Get all products and slots
  const products = await prisma.product.findMany({ take: 50 });
  const slots = await prisma.slot.findMany();
  
  console.log(`📦 Found ${products.length} products and ${slots.length} slots`);
  
  if (slots.length === 0) {
    console.error('❌ No slots found! Run shelf seeder first.');
    return;
  }
  
  // Assign each product to 1-3 random slots
  for (const product of products) {
    const numSlots = Math.floor(Math.random() * 3) + 1; // 1-3 slots per product
    const assignedSlots = [];
    
    for (let i = 0; i < numSlots; i++) {
      const randomSlot = slots[Math.floor(Math.random() * slots.length)];
      
      // Check if already assigned
      if (assignedSlots.includes(randomSlot.id)) continue;
      
      try {
        await prisma.slotDetail.create({
          data: {
            productId: product.id,
            slotId: randomSlot.id,
          },
        });
        assignedSlots.push(randomSlot.id);
        console.log(`✅ Assigned Product ${product.id} to Slot ${randomSlot.id}`);
      } catch (error) {
        // Ignore duplicate key errors
        console.log(`⚠️ Slot ${randomSlot.id} already assigned to Product ${product.id}`);
      }
    }
  }
  
  console.log('✅ SlotDetails seeding completed!');
}

seedSlotDetails()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
