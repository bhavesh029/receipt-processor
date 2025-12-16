-- CreateTable
CREATE TABLE "ReceiptFile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "file_name" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "file_hash" TEXT NOT NULL,
    "is_valid" BOOLEAN NOT NULL DEFAULT false,
    "invalid_reason" TEXT,
    "is_processed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Receipt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "purchased_at" DATETIME,
    "merchant_name" TEXT,
    "total_amount" REAL,
    "receipt_file_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Receipt_receipt_file_id_fkey" FOREIGN KEY ("receipt_file_id") REFERENCES "ReceiptFile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ReceiptFile_file_hash_key" ON "ReceiptFile"("file_hash");

-- CreateIndex
CREATE UNIQUE INDEX "Receipt_receipt_file_id_key" ON "Receipt"("receipt_file_id");
