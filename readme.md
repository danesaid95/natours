# Natours Application

A full-stack tour booking application built with Node.js, Express, MongoDB, and Pug templates. Users can browse tours, make bookings with Stripe payments, manage their accounts, and leave reviews.

## Features

- User authentication with JWT (signup, login, password reset)
- Tour browsing with interactive Mapbox maps
- Secure credit card payments via Stripe Checkout
- User account management (profile, photo upload, password change)
- Email notifications (welcome emails, password reset)
- Tour reviews and ratings
- Booking history

## Tech Stack

### Backend
- **Node.js** & **Express** - Server and API
- **MongoDB** & **Mongoose** - Database and ODM
- **Pug** - Server-side templating

### Authentication & Security
- **JWT** - Token-based authentication
- **bcrypt** - Password hashing
- **Helmet** - Security headers
- **express-rate-limit** - Rate limiting
- **express-mongo-sanitize** - NoSQL injection prevention
- **xss-clean** - XSS protection

### Payments & Email
- **Stripe** - Payment processing
- **Nodemailer** - Email sending
- **html-to-text** - Email text conversion

### File Handling
- **Multer** - File uploads
- **Sharp** - Image processing

### Frontend
- **Mapbox GL** - Interactive maps
- **Axios** - HTTP requests
- **esbuild** - JavaScript bundling

## Installation

1. Clone the repository
```bash
git clone <repository-url>
cd natours
```

2. Install dependencies
```bash
npm install
```

3. Create a `config.env` file in the root directory:
```env
NODE_ENV=development
PORT=3008
DATABASE=<your-mongodb-connection-string>
DATABASE_PASSWORD=<your-database-password>

JWT_SECRET=<your-jwt-secret>
JWT_EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=90

EMAIL_USERNAME=<mailtrap-username>
EMAIL_PASSWORD=<mailtrap-password>
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_FROM=hello@natours.io

SENDGRID_USERNAME=apikey
SENDGRID_PASSWORD=<your-sendgrid-api-key>

STRIPE_SECRET_KEY=<your-stripe-secret-key>
```

4. Run the application
```bash
# Development
npm run dev

# Production
npm run start:prod
```

## API Endpoints

### Authentication
- `POST /api/v1/users/signup` - Register new user
- `POST /api/v1/users/login` - Login user
- `GET /api/v1/users/logout` - Logout user
- `POST /api/v1/users/forgotPassword` - Request password reset
- `PATCH /api/v1/users/resetPassword/:token` - Reset password

### Tours
- `GET /api/v1/tours` - Get all tours
- `GET /api/v1/tours/:id` - Get single tour
- `POST /api/v1/tours` - Create tour (admin)
- `PATCH /api/v1/tours/:id` - Update tour (admin)
- `DELETE /api/v1/tours/:id` - Delete tour (admin)

### Users
- `GET /api/v1/users/me` - Get current user
- `PATCH /api/v1/users/updateMe` - Update current user
- `DELETE /api/v1/users/deleteMe` - Deactivate account
- `PATCH /api/v1/users/updateMyPassword` - Update password

### Reviews
- `GET /api/v1/reviews` - Get all reviews
- `POST /api/v1/tours/:tourId/reviews` - Create review
- `PATCH /api/v1/reviews/:id` - Update review
- `DELETE /api/v1/reviews/:id` - Delete review

### Bookings
- `GET /api/v1/bookings/checkout-session/:tourId` - Get Stripe checkout session

## Project Structure

```
natours/
├── controllers/        # Route handlers
├── models/            # Mongoose models
├── routes/            # Express routes
├── views/             # Pug templates
├── public/            # Static files
│   ├── css/
│   ├── img/
│   └── js/
├── utils/             # Utility functions
├── dev-data/          # Development data
├── app.js             # Express app setup
├── server.js          # Server entry point
└── config.env         # Environment variables
```

## Scripts

- `npm run dev` - Start development server with nodemon
- `npm run start:prod` - Start production server
- `npm run build:js` - Bundle JavaScript with esbuild
- `npm run watch:js` - Watch and bundle JavaScript
- `npm run debug` - Start with Node inspector

## License

ISC
