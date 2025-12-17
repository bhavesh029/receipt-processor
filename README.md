# Smart Receipt Processor (AI-Powered)

A robust full-stack application that extracts structured data (Merchant, Date, Total) from PDF receipts using **Google Gemini AI**. It includes a REST API and a built-in Web UI for testing.

## 🚀 Features
* **AI-Powered Extraction:** Uses Multimodal LLMs (Gemini Flash) to "read" receipts like a human, avoiding brittle Regex parsing.
* **Web Interface:** A clean, single-page UI to upload, validate, and view receipts in real-time.
* **Duplicate Detection:** SHA-256 hashing ensures the same file is never processed twice.
* **PDF Validation:** Rigorous "Magic Byte" checks to reject fake PDF files.
* **SQLite Database:** Zero-configuration local database using Prisma ORM.

## 🛠️ Tech Stack
* **Framework:** NestJS (Node.js)
* **Language:** TypeScript
* **Database:** SQLite + Prisma ORM
* **AI Engine:** Google Gemini (Generative AI SDK)
* **Docs:** Swagger / OpenAPI

## ⚙️ Setup & Installation

1.  **Clone the repository**
    ```bash
    git clone <your-repo-url>
    cd receipt-processor
    ```

2.  **Environment Configuration**
    Create a `.env` file in the root directory:
    ```env
    DATABASE_URL="file:./dev.db"
    GEMINI_API_KEY="YOUR_GOOGLE_GEMINI_KEY"
    ```
    *(Get a free key here: https://aistudio.google.com/app/apikey)*

3.  **One-Click Setup**
    This command installs dependencies, generates the Prisma client, and initializes the database.
    ```bash
    npm run setup
    ```

4.  **Run the Server**
    ```bash
    npm run start:dev
    ```
    The application will start at **http://localhost:3000**.

## 🖥️ How to Use

### 1. The Web UI (Recommended)
Open **http://localhost:3000** in your browser.
* **Upload:** Select a PDF receipt and click "Upload & Process".
* **Status:** Watch the real-time status as the file is hashed, validated, and sent to the AI.
* **View:** The processed data (Merchant, Date, Total) will appear in the table below.

### 2. API Documentation (Swagger)
Visit **http://localhost:3000/api** to see the interactive API docs.

**Core Endpoints:**
* **`POST /upload`**: Uploads a PDF. Returns a File ID.
* **`POST /validate`**: Checks file integrity (Magic Bytes).
* **`POST /process`**: Triggers AI extraction.
* **`GET /receipts`**: Fetches the list of all processed receipts.

## 🧠 Why AI instead of Tesseract OCR?
Traditional OCR outputs raw text streams that require complex Regex to parse. By using **Gemini Flash**, we treat the receipt as an image and ask the LLM to return structured JSON directly. This handles:
* Different receipt layouts (Walmart vs. Uber vs. Handwritten).
* Crinkled or blurry images.
* Contextual understanding (distinguishing "Total" from "Subtotal").

## 🧪 Database & Scripts
* **`npm run db:studio`**: Opens the Prisma Studio web UI to inspect the database.
* **`npm run db:reset`**: Wipes the database and restarts migrations.
* **`npm run test`**: Runs unit tests.