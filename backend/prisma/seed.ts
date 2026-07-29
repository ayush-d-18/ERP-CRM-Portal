import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcrypt";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // Hash passwords
  const adminPassword = await bcrypt.hash("Admin@123", 10);
  const salesPassword = await bcrypt.hash("Sales@123", 10);
  const warehousePassword = await bcrypt.hash("Warehouse@123", 10);
  const accountsPassword = await bcrypt.hash("Accounts@123", 10);

  // Create users
  console.log("📝 Creating users...");
  const admin = await prisma.user.create({
    data: {
      email: "admin@erp.com",
      password: adminPassword,
      name: "Admin User",
      role: "ADMIN",
    },
  });
  console.log(`✅ Admin: ${admin.email}`);

  const sales = await prisma.user.create({
    data: {
      email: "sales@erp.com",
      password: salesPassword,
      name: "Sales User",
      role: "SALES",
    },
  });
  console.log(`✅ Sales: ${sales.email}`);

  const warehouse = await prisma.user.create({
    data: {
      email: "warehouse@erp.com",
      password: warehousePassword,
      name: "Warehouse User",
      role: "WAREHOUSE",
    },
  });
  console.log(`✅ Warehouse: ${warehouse.email}`);

  const accounts = await prisma.user.create({
    data: {
      email: "accounts@erp.com",
      password: accountsPassword,
      name: "Accounts User",
      role: "ACCOUNTS",
    },
  });
  console.log(`✅ Accounts: ${accounts.email}`);

  // Create products
  console.log("📦 Creating products...");
  const product1 = await prisma.product.create({
    data: {
      name: "Laptop Pro",
      sku: "LAPTOP-001",
      category: "Electronics",
      unitPrice: 1299.99,
      currentStock: 100,
      minStockLevel: 10,
      warehouse: "Warehouse A",
    },
  });
  console.log(`✅ Product: ${product1.name}`);

  const product2 = await prisma.product.create({
    data: {
      name: "USB-C Cable",
      sku: "CABLE-001",
      category: "Accessories",
      unitPrice: 12.99,
      currentStock: 100,
      minStockLevel: 50,
      warehouse: "Warehouse A",
    },
  });
  console.log(`✅ Product: ${product2.name}`);

  const product3 = await prisma.product.create({
    data: {
      name: "Wireless Mouse",
      sku: "MOUSE-001",
      category: "Accessories",
      unitPrice: 29.99,
      currentStock: 100,
      minStockLevel: 20,
      warehouse: "Warehouse B",
    },
  });
  console.log(`✅ Product: ${product3.name}`);

  // Create customers
  console.log("👥 Creating customers...");
  const customer1 = await prisma.customer.create({
    data: {
      name: "Acme Corp",
      mobile: "+1-555-0101",
      email: "contact@acmecorp.com",
      businessName: "Acme Corporation",
      gstNumber: "29ABCDE1234F1Z5",
      customerType: "WHOLESALE",
      address: "123 Business St, New York, NY 10001",
      status: "ACTIVE",
      assignedToId: sales.id,
    },
  });
  console.log(`✅ Customer: ${customer1.name}`);

  const customer2 = await prisma.customer.create({
    data: {
      name: "Tech Store",
      mobile: "+1-555-0102",
      email: "sales@techstore.com",
      businessName: "Tech Retail Store",
      gstNumber: "27ABCDE5678F1Z5",
      customerType: "RETAIL",
      address: "456 Main St, Los Angeles, CA 90001",
      status: "LEAD",
      assignedToId: sales.id,
    },
  });
  console.log(`✅ Customer: ${customer2.name}`);

  console.log("✨ Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
