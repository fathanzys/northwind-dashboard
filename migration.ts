import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Checking for fields...");
    try {
        await prisma.$executeRawUnsafe(`ALTER TABLE "Employees" ADD COLUMN "Email" VARCHAR(100) UNIQUE;`);
        await prisma.$executeRawUnsafe(`ALTER TABLE "Employees" ADD COLUMN "PasswordHash" VARCHAR(255);`);
        await prisma.$executeRawUnsafe(`ALTER TABLE "Employees" ADD COLUMN "Role" VARCHAR(20) DEFAULT 'user';`);
        console.log("Columns added successfully!");
    } catch (e: any) {
        console.log("Error or columns may already exist:", e.message);
    }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
