import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("test12345", 10);

  await prisma.technician.create({
    data: {
      name: "Test Technician",
      email: "user@test.com",
      password: hashedPassword,
    },
  });

  await prisma.admin.create({
    data: {
      name: "Test Admin",
      email: "admin@test.com",
      password: hashedPassword,
    },
  });

  console.log("✅ Dummy technician and admin created!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding:", e);
  })
  .finally(() => {
    prisma.$disconnect();
  });
