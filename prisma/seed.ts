import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const PRODUCTS = [
  "Card Acceptance",
  "Wallet Acceptance",
  "Erada Financing",
  "Loyalty",
  "EBU",
  "Cash Collection",
  "HR Payroll",
  "HR Salary in Advance",
];

async function main() {
  console.log("🌱 Seeding LeadForce products...");

  for (const name of PRODUCTS) {
    await prisma.product.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    console.log(`  ✓ ${name}`);
  }

  console.log("✅ Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
