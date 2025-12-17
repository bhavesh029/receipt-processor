/*
  Warnings:

  - Added the required column `file_path` to the `Receipt` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Receipt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "purchased_at" DATETIME,
    "merchant_name" TEXT,
    "total_amount" REAL,
    "file_path" TEXT NOT NULL,
    "receipt_file_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Receipt_receipt_file_id_fkey" FOREIGN KEY ("receipt_file_id") REFERENCES "ReceiptFile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Receipt" ("created_at", "id", "merchant_name", "purchased_at", "receipt_file_id", "total_amount", "updated_at") SELECT "created_at", "id", "merchant_name", "purchased_at", "receipt_file_id", "total_amount", "updated_at" FROM "Receipt";
DROP TABLE "Receipt";
ALTER TABLE "new_Receipt" RENAME TO "Receipt";
CREATE UNIQUE INDEX "Receipt_receipt_file_id_key" ON "Receipt"("receipt_file_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
