import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("password123", 10);

  await prisma.technician.create({
    data: {
      name: "Test Technician",
      email: "tech@example.com",
      password: hashedPassword,
    },
  });

  console.log("✅ Dummy technician created!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding:", e);
  })
  .finally(() => {
    prisma.$disconnect();
  });
