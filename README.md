# Smart Receipt Processor (AI-Powered)

A robust NestJS application that extracts structured data (Merchant, Date, Total) from PDF receipts using **Google Gemini AI**. Built for speed, accuracy, and scalability.

## 🚀 Features
* **AI-Powered Extraction:** Uses Multimodal LLMs (Gemini Flash) to "read" receipts like a human, avoiding brittle Regex parsing.
* **Duplicate Detection:** SHA-256 hashing ensures the same file is never processed twice.
* **PDF Validation:** rigorous "Magic Byte" checks to reject fake PDF files.
* **SQLite Database:** Zero-configuration local database using Prisma ORM.
* **Swagger Documentation:** Interactive API testing UI.

## 🛠️ Tech Stack
* **Framework:** NestJS (Node.js)
* **Language:** TypeScript
* **Database:** SQLite + Prisma ORM
* **AI Engine:** Google Gemini (Generative AI SDK)
* **Validation:** `class-validator` & SHA-256 Hashing

## ⚙️ Setup & Installation

1.  **Clone the repository**
    ```bash
    git clone <your-repo-url>
    cd receipt-processor
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory:
    ```env
    DATABASE_URL="file:./dev.db"
    GEMINI_API_KEY="YOUR_GOOGLE_GEMINI_KEY"
    ```
    *(Get a free key here: https://aistudio.google.com/app/apikey)*

4.  **Initialize Database**
    ```bash
    npx prisma migrate dev --name init
    ```

5.  **Run the Server**
    ```bash
    npm run start:dev
    ```
    The server will start at `http://localhost:3000`.

## 📖 API Documentation (Swagger)
Visit **http://localhost:3000/api** to see the interactive documentation and test endpoints directly.

### Core Endpoints
1.  **`POST /upload`**: Uploads a PDF receipt. Returns a file ID.
    * *Input:* `multipart/form-data` (file)
2.  **`POST /receipt/validate`**: Checks if the uploaded file is a valid PDF.
    * *Input:* `{ "id": "uuid..." }`
3.  **`POST /receipt/process`**: Triggers AI extraction and saves data to DB.
    * *Input:* `{ "id": "uuid..." }`
4.  **`GET /receipt`**: List all processed receipts.

## 🧠 Why AI instead of OCR?
Traditional OCR (Tesseract) outputs raw text streams that require complex Regex to parse. By using **Gemini Flash**, we treat the receipt as an image and ask the LLM to return structured JSON directly. This handles:
* Different receipt layouts (Walmart vs. Uber vs. Handwritten).
* Crinkled or blurry images.
* Contextual understanding (distinguishing "Total" from "Subtotal").

## 🧪 Testing
Run the unit tests:
```bash
npm run test