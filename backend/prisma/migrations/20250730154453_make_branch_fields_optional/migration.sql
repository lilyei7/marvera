-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_branches" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "postalCode" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "openingHours" TEXT,
    "services" TEXT,
    "description" TEXT,
    "image" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_branches" ("address", "city", "createdAt", "description", "email", "id", "image", "isActive", "latitude", "longitude", "name", "openingHours", "phone", "postalCode", "services", "state", "updatedAt") SELECT "address", "city", "createdAt", "description", "email", "id", "image", "isActive", "latitude", "longitude", "name", "openingHours", "phone", "postalCode", "services", "state", "updatedAt" FROM "branches";
DROP TABLE "branches";
ALTER TABLE "new_branches" RENAME TO "branches";
CREATE UNIQUE INDEX "branches_name_key" ON "branches"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
