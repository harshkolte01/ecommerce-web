# E-COMMERCE APPLICATION

## Overview and Key Features

This is a full-stack e-commerce application built with modern web technologies. The application provides a complete online shopping experience with separate interfaces for customers and administrators.

### Key Features

**Customer Features:**
- Browse products with pagination 
- Advanced product filtering 
- Debounced search functionality to optimize performance
- Shopping cart with persistent state
- User authentication and registration
- Order placement and order history
- Responsive design for all devices

**Admin Features:**
- Admin dashboard with comprehensive analytics
- Product management => CRUD
- Automatic SKU generation with category prefixes
- Sales reports with filtering options
- Customer analytics and top customers report
- Category-wise product summaries
- Role-based access control

**Technical Features:**
- Dual database architecture => PostgreSQL + MongoDB
- JWT-based authentication with persistent sessions
- Toast notifications
- Server-side pagination and filtering
- Clean, professional UI with TailwindCSS
- Type-safe development with TypeScript

## Tech Stack and Dependencies

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Databases:** 
  - PostgreSQL (with Prisma ORM) - for users, orders, and relational data
  - MongoDB (with Mongoose) - for product catalog
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcrypt
- **Environment:** dotenv
- **CORS:** cors middleware

### Frontend
- **Framework:** Next.js 15+ (React 18+)
- **Language:** TypeScript
- **Styling:** TailwindCSS
- **State Management:** React Context API
- **HTTP Client:** Fetch API
- **Icons:** Heroicons (optional)

### Development Tools
- **Package Manager:** npm
- **Database Migration:** Prisma
- **Code Quality:** ESLint, Prettier 

## Setup and Environment Variable Details

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- MongoDB database
- npm or yarn package manager

### Backend Setup

1. **Clone the repository and navigate to backend:**
```bash
cd backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Environment Variables:**
Create a `.env` file in the backend directory with the following variables:

```env
# Server Configuration
PORT=4000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# PostgreSQL Database (Prisma)
DATABASE_URL="postgresql://username:password@localhost:5432/ecommerce_db"

# MongoDB Database
MONGODB_URI="mongodb://localhost:27017/ecommerce_products"

# Bcrypt Configuration
BCRYPT_SALT_ROUNDS=12
```

### Frontend Setup

1. **Navigate to frontend directory:**
```bash
cd ../frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Environment Variables:**
Create a `.env.local` file in the frontend directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## Database Configuration and Migration Steps

### PostgreSQL Setup (Prisma)

1. **Install PostgreSQL** and create a database named `ecommerce_db`

2. **Generate Prisma Client:**
```bash
cd backend
npx prisma generate
```

3. **Run Database Migrations:**
```bash
npx prisma migrate dev --name init
```

4. **Seed the Database:**
```bash
# Seed users (admin and customers)
node dataseed/seedUsers.js

# Seed products
node dataseed/seedProducts.js

# Seed orders (requires users and products to exist)
node dataseed/seedOrders.js
```

### MongoDB Setup

1. **Install MongoDB** and ensure it's running on default port 27017

2. **The MongoDB connection will be established automatically when you start the backend server**

3. **Products will be seeded automatically when running the seed scripts**

### Database Schema

#### PostgreSQL Schema (Prisma)

**User Table:**
```sql
model User {
  id           Int      @id @default(autoincrement())
  name         String
  email        String   @unique
  passwordHash String
  role         String   @default("customer") // "customer" | "admin"
  createdAt    DateTime @default(now())
  
  // Relations
  orders       Order[]
  
  @@index([email])
}
```

**Order Table:**
```sql
model Order {
  id        Int      @id @default(autoincrement())
  userId    Int
  total     Decimal  @db.Decimal(10,2)
  createdAt DateTime @default(now())
  
  // Relations
  user      User        @relation(fields: [userId], references: [id])
  items     OrderItem[]
  
  @@index([userId])
  @@index([createdAt])
}
```

**OrderItem Table:**
```sql
model OrderItem {
  id              Int     @id @default(autoincrement())
  orderId         Int
  productId       String  // MongoDB ObjectId or SKU
  productName     String  // Snapshot at purchase
  quantity        Int
  priceAtPurchase Decimal @db.Decimal(10,2)
  
  // Relations
  order           Order   @relation(fields: [orderId], references: [id])
  
  @@index([orderId])
  @@index([productId])
}
```

#### MongoDB Schema (Mongoose)

**Product Collection:**
```javascript
{
  _id: ObjectId,           // Auto-generated MongoDB ID
  sku: String,             // Unique product SKU (required, indexed)
  name: String,            // Product name (required, indexed)
  description: String,     // Product description (optional)
  price: Number,           // Product price (required)
  category: String,        // Product category (indexed)
  stock: Number,           // Available stock (default: 0)
  updatedAt: Date,         // Last update timestamp (default: now, indexed)
  createdAt: Date          // Creation timestamp (auto-generated)
}
```

**Indexes:**
- `sku` - Unique index for fast SKU lookups
- `name` - Text index for search functionality
- `category` - Index for category filtering
- `updatedAt` - Index for sorting by recent updates
- `price` - Index for price range queries

#### Database Relationships

**PostgreSQL Relationships:**
- `User` → `Order` (One-to-Many): A user can have multiple orders
- `Order` → `OrderItem` (One-to-Many): An order can have multiple items
- `User` → `OrderItem` (Through Order): Indirect relationship for user's purchased items

**Cross-Database Relationships:**
- `OrderItem.productId` references `Product.sku` or `Product._id` in MongoDB
- This creates a flexible relationship allowing products to be referenced by either SKU or MongoDB ObjectId

#### Key Design Decisions

1. **Dual Database Architecture:**
   - PostgreSQL for transactional data (users, orders) requiring ACID properties
   - MongoDB for product catalog requiring flexible schema and fast reads

2. **Product Snapshot in Orders:**
   - `OrderItem` stores `productName` and `priceAtPurchase` to maintain order history even if products are updated or deleted

3. **Flexible Product References:**
   - `OrderItem.productId` can store either MongoDB ObjectId or SKU for maximum flexibility

4. **Optimized Indexing:**
   - Strategic indexes on frequently queried fields for optimal performance
   - Unique constraints where necessary (email, SKU)

5. **Scalable Design:**
   - Separate databases allow independent scaling
   - Indexed fields support efficient filtering and searching

## Testing Instructions

Currently, this application doesn't have automated testing features implemented. I don't have extensive knowledge about testing frameworks and wasn't able to implement it properly within the project timeline due to ongoing exams. However, I am very interested to learn testing methodologies and implement comprehensive test coverage in future versions.

**Manual Testing:**
1. Start both backend and frontend servers
2. Test user registration and login
3. Browse products and test filtering/search
4. Add products to cart and complete checkout
5. Test admin login and product management
6. Verify reports and analytics functionality

## API and Frontend Route Summaries

### Backend API Routes

**Authentication Routes (`/api/auth`):**
- `POST /register` - User registration
- `POST /login` - User login
- `GET /me` - Get current user profile

**Product Routes (`/api/products`):**
- `GET /` - Get products with pagination and filtering
- `GET /:id` - Get single product
- `POST /` - Create product (admin only)
- `PUT /:id` - Update product (admin only)
- `DELETE /:id` - Delete product (admin only)

**Order Routes (`/api/orders`):**
- `GET /` - Get user orders
- `GET /:id` - Get single order

**Checkout Routes (`/api/checkout`):**
- `POST /` - Create new order

**Report Routes (`/api/reports`):**
- `GET /sql/daily-revenue` - Daily revenue report
- `GET /sql/top-customers` - Top customers report
- `GET /mongo/category-summary` - Category summary report

### Frontend Routes

**Public Routes:**
- `/` - Home page (8 products + show more button)
- `/products` - Products listing (12 per page with pagination)
- `/products/[id]` - Product details
- `/auth/login` - Login page
- `/auth/register` - Registration page

**Protected Routes (Customer):**
- `/cart` - Shopping cart
- `/orders` - Order history
- `/orders/[id]` - Order details

**Admin Routes:**
- `/admin` - Admin dashboard
- `/admin/products` - Product management
- `/admin/products/new` - Add new product
- `/admin/products/[id]` - Edit product
- `/admin/reports` - Sales and analytics reports

## Deployment URLs

**Development URLs:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000

**Production URLs:**
- Frontend: https://harsh-kolte-220670107027.vercel.app
- Backend API: https://harsh-kolte-220670107027.onrender.com

## Admin Login Credentials

For evaluation and testing purposes, use these admin credentials:

**Admin Account 1:**
- Email: `admin1@example.com`
- Password: `admin1@example.com`

**Admin Account 2:**
- Email: `admin2@example.com`
- Password: `admin2@example.com`

**Test Customer Accounts:**
- Email: `user1@example.com`
- Password: `user1@example.com`

## Running the Application

### Development Mode

1. **Start Backend Server:**
```bash
cd backend
node server.js
# Server runs on http://localhost:4000
```

2. **Start Frontend Server:**
```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:3000
```

## Project Structure

```
e-commerce-app/
├── README.md            
├── .vscode/            
├── backend/
│   ├── .gitignore      
│   ├── package.json    
│   ├── server.js       # Main server file
│   ├── prisma.config.ts # Prisma configuration
│   ├── config/         # Configuration files
│   │   ├── index.js    # Main config
│   │   ├── jwt.js      
│   │   └── mongoDB.js  # MongoDB connection
│   ├── controllers/    # Route controllers
│   │   ├── authController.js
│   │   ├── checkoutController.js
│   │   ├── orderController.js
│   │   ├── productController.js
│   │   └── reportController.js
│   ├── middlewares/    # Custom middlewares
│   │   ├── authMiddleware.js
│   │   ├── roleMiddleware.js
│   │   ├── validateCheckout.js
│   │   └── validateProduct.js
│   ├── models/         # MongoDB models
│   │   └── product.model.js
│   ├── routes/         # API routes
│   │   ├── authRoute.js
│   │   ├── checkoutRoute.js
│   │   ├── orderRoute.js
│   │   ├── productRoute.js
│   │   └── reportRoute.js
│   ├── services/       # Business logic
│   │   ├── checkoutService.js
│   │   ├── orderService.js
│   │   ├── productService.js
│   │   └── reportService.js
│   ├── dataseed/       # Database seeding scripts
│   │   ├── seedUsers.js
│   │   ├── seedProducts.js
│   │   └── seedOrders.js
│   ├── prisma/         # Prisma schema and migrations
│   │   ├── schema.prisma
│   │   └── migrations/
│   └── generated/      # Generated Prisma client
└── frontend/
    ├── .gitignore      
    ├── package.json    
    ├── next.config.ts  
    ├── tsconfig.json   
    ├── components.json # UI components config
    ├── app/            # Next.js app directory 
    │   ├── layout.tsx  # Root layout
    │   ├── page.tsx    # Home page
    │   ├── globals.css 
    │   ├── admin/      # Admin pages
    │   │   ├── page.tsx
    │   │   ├── products/
    │   │   └── reports/
    │   ├── auth/       # Authentication pages
    │   │   ├── login/
    │   │   └── register/
    │   ├── cart/       # Shopping cart
    │   ├── orders/     # Order management
    │   └── products/   # Product pages
    ├── components/     # Reusable components
    │   ├── Navbar.tsx
    │   ├── Footer.tsx
    │   ├── Pagination.tsx
    │   ├── admin/      # Admin components
    │   ├── order/      # Order components
    │   ├── product/    # Product components
    │   └── ui/         # UI library components
    ├── contexts/       # React contexts
    │   ├── AuthContext.tsx
    │   ├── CartContext.tsx
    │   └── ToastContext.tsx
    ├── hooks/          # Custom hooks
    │   ├── useApi.ts
    │   ├── useAuth.ts
    │   └── use-mobile.ts
    ├── lib/            # Utility functions
    │   ├── api.ts
    │   ├── auth.ts
    │   └── utils.ts
    └── public/         
        ├── next.svg
        ├── vercel.svg
        └── *.svg
```

This project is for educational purposes and personal portfolio demonstration.
