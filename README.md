# Image Background Remover

A simple web tool to remove image backgrounds using the Remove.bg API.

## Features

- Upload images via drag & drop or file picker
- Supports PNG and JPG images (max 10MB)
- Automatic background removal using Remove.bg API
- Side-by-side preview of original and result
- One-click download of processed image
- Responsive design for mobile and desktop

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure API Key

Get your free API key from [Remove.bg API](https://www.remove.bg/api):

```bash
# Copy the example env file
cp .env.example .env.local

# Edit .env.local and add your API key
REMOVE_BG_API_KEY=your_api_key_here
```

Note: Free tier includes 50 API calls per month.

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production

```bash
npm run build
npm start
```

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **Image Processing**: Remove.bg API

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── remove-bg/
│   │   │       └── route.ts    # API route for background removal
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx            # Main page component
│   └── components/             # Reusable components (future)
├── .env.example
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── README.md
└── tsconfig.json
```

## License

MIT
