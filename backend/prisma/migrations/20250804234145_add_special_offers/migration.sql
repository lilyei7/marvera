/*
  Warnings:

  - You are about to drop the column `city` on the `branches` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `branches` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `branches` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `branches` table. All the data in the column will be lost.
  - You are about to drop the column `postalCode` on the `branches` table. All the data in the column will be lost.
  - You are about to drop the column `services` on the `branches` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `branches` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "wholesale_products" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "pricePerBox" REAL NOT NULL,
    "unitsPerBox" INTEGER NOT NULL,
    "unitType" TEXT NOT NULL DEFAULT 'kg',
    "categoryId" INTEGER,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "minimumOrder" INTEGER NOT NULL DEFAULT 1,
    "images" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "wholesale_products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "wholesale_orders" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orderNumber" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "subtotal" REAL NOT NULL,
    "shippingCost" REAL NOT NULL DEFAULT 0,
    "tax" REAL NOT NULL DEFAULT 0,
    "total" REAL NOT NULL,
    "paymentMethod" TEXT,
    "paymentStatus" TEXT NOT NULL DEFAULT 'pending',
    "shippingAddress" TEXT,
    "deliveryDate" DATETIME,
    "driverId" INTEGER,
    "trackingCode" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "wholesale_orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "wholesale_orders_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "drivers" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "wholesale_order_items" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "wholesaleOrderId" INTEGER NOT NULL,
    "wholesaleProductId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "pricePerBox" REAL NOT NULL,
    "total" REAL NOT NULL,
    CONSTRAINT "wholesale_order_items_wholesaleOrderId_fkey" FOREIGN KEY ("wholesaleOrderId") REFERENCES "wholesale_orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "wholesale_order_items_wholesaleProductId_fkey" FOREIGN KEY ("wholesaleProductId") REFERENCES "wholesale_products" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "special_offers" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "originalPrice" REAL NOT NULL,
    "discountPrice" REAL NOT NULL,
    "discountPercent" REAL,
    "imageUrl" TEXT,
    "backgroundColor" TEXT NOT NULL DEFAULT '#1E3A8A',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "validFrom" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" DATETIME,
    "productIds" TEXT,
    "maxRedemptions" INTEGER,
    "currentRedemptions" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_branches" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "openingHours" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "imageUrl" TEXT,
    "images" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_branches" ("address", "createdAt", "id", "isActive", "latitude", "longitude", "name", "openingHours", "phone", "updatedAt") SELECT "address", "createdAt", "id", "isActive", "latitude", "longitude", "name", "openingHours", "phone", "updatedAt" FROM "branches";
DROP TABLE "branches";
ALTER TABLE "new_branches" RENAME TO "branches";
CREATE TABLE "new_users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT,
    "role" TEXT NOT NULL DEFAULT 'CUSTOMER',
    "businessName" TEXT,
    "businessType" TEXT,
    "taxId" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "postalCode" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "lastLogin" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" INTEGER,
    CONSTRAINT "users_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_users" ("createdAt", "email", "firstName", "id", "isActive", "lastName", "password", "phone", "role", "updatedAt") SELECT "createdAt", "email", "firstName", "id", "isActive", "lastName", "password", "phone", "role", "updatedAt" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "wholesale_orders_orderNumber_key" ON "wholesale_orders"("orderNumber");
