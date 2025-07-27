# 🌊 MarVera - Premium Seafood E-commerce Platform

MarVera is a premium seafood e-commerce platform with real-time delivery tracking, designed to bring the freshest seafood from the ocean directly to your table.

## 🚀 Features

### 🐟 **Seafood Catalog**
- Products organized by categories (fish, shrimp, oysters, lobsters, crabs, mollusks)
- Advanced filtering by price, type, and availability
- Detailed product view with origin and characteristics
- High-quality product images

### 🛒 **Shopping Experience**
- Persistent shopping cart (localStorage)
- Checkout with payment options:
  - Credit card payments (Stripe integration)
  - Cash on delivery
- Delivery time selection
- Responsive design (mobile-first)

### 📍 **Real-time Delivery Tracking**
- Automatic assignment of nearby delivery drivers
- Live tracking panel with:
  - Interactive map (Mapbox GL JS)
  - Real-time GPS location updates
  - Estimated delivery time
  - Optimized route visualization

### 🔔 **Notifications**
- Order status alerts (new, in transit, delivered)
- Push notifications for important updates
- Real-time Socket.IO updates

### 👑 **Admin Panel**
- Product/inventory management
- Driver monitoring
- Order visualization and management

## 🛠️ Tech Stack

### Frontend
- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** for styling
- **Redux Toolkit** for state management
- **React Router** for navigation
- **Mapbox GL JS** for maps and tracking
- **Socket.IO Client** for real-time updates
- **Stripe** for payments

### Backend
- **Node.js** + **Express** + **TypeScript**
- **PostgreSQL** (main database)
- **Firebase Realtime DB** (GPS tracking)
- **JWT** authentication
- **Socket.IO** for real-time communication
- **Stripe API** for payments

### Deployment
- **Frontend**: Vercel
- **Backend**: Render
- **Database**: Supabase (PostgreSQL)

## 🎨 Design System

### Color Palette
- **Primary Colors**:
  - Marina Blue: `#1E3A8A` (buttons, headers)
  - White: `#FFFFFF` (main background)
- **Secondary Colors**:
  - Turquoise: `#40E0D0` (accents, highlights)
  - Light Blue: `#87CEEB` (secondary backgrounds)
  - Soft Gray: `#F5F7FA` (content areas)

### Typography
- **Font Family**: Montserrat
- **Style**: Minimalist marine theme
- **Elements**: Rounded borders, subtle shadows
- **Visual Elements**: Stylized waves, seafood icons

## 🏃‍♂️ Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Frontend Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev

# Build for production
npm run build
npm start
```

## 📁 Project Structure

```
marvera/
├── src/                    # Frontend source code
│   ├── components/         # Reusable components
│   ├── pages/             # Page components
│   ├── store/             # Redux store and slices
│   ├── services/          # API services
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Utility functions
├── backend/               # Backend API
│   ├── src/               # Backend source code
│   ├── dist/              # Compiled JavaScript
│   └── .env.example       # Environment variables template
├── public/                # Static assets
└── README.md             # Project documentation
```

## 🔧 Available Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Backend
- `npm run dev` - Start development server with nodemon
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start production server

## 🌐 API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id/status` - Update order status

### Tracking
- `GET /api/track/:orderId` - Get delivery tracking info

### Health
- `GET /api/health` - API health check

## 🔌 Socket.IO Events

### Client → Server
- `joinOrder` - Join order tracking room
- `driverLocationUpdate` - Update driver location

### Server → Client
- `orderUpdate` - Order status updated
- `driverLocationUpdate` - Driver location updated

## 🚀 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Deploy automatically on push to main

### Backend (Render)
1. Connect your GitHub repository to Render
2. Set build command: `npm run build`
3. Set start command: `npm start`
4. Configure environment variables

## 🔐 Environment Variables

### Frontend
Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:3001
VITE_MAPBOX_TOKEN=your_mapbox_token
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key
```

### Backend
Create a `.env` file in the `backend` directory:

```env
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your-secret-key
STRIPE_SECRET_KEY=your_stripe_secret
MAPBOX_ACCESS_TOKEN=your_mapbox_token
```

## 📝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Frontend**: React.js + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + PostgreSQL
- **Real-time**: Socket.IO + Firebase
- **Maps**: Mapbox GL JS
- **Payments**: Stripe

## 📞 Support

For support, email support@marvera.com or create an issue in this repository.

---

**MarVera** - *Premium seafood, delivered fresh* 🌊🐟

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
