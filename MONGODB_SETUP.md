# MongoDB Setup for Drishti Platform

This guide will help you set up MongoDB for the Drishti platform. You can choose between local MongoDB installation or MongoDB Atlas (cloud).

## Option 1: Local MongoDB Installation

### Install MongoDB

**macOS (using Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb/brew/mongodb-community
```

**Ubuntu/Debian:**
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

**Windows:**
1. Download MongoDB Community Server from https://www.mongodb.com/try/download/community
2. Install and start MongoDB service
3. MongoDB will run on `mongodb://localhost:27017` by default

### Environment Configuration

1. Copy the environment template:
```bash
cp .env.example .env
```

2. Update the `.env` file with your MongoDB connection:
```env
MONGODB_URI=mongodb://localhost:27017/drishti
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

## Option 2: MongoDB Atlas (Cloud)

### Create MongoDB Atlas Account

1. Go to https://www.mongodb.com/atlas
2. Sign up for a free account
3. Create a new cluster (free tier available)
4. Create a database user
5. Whitelist your IP address (or use 0.0.0.0/0 for development)

### Get Connection String

1. In Atlas dashboard, click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your database user password

### Environment Configuration

Update your `.env` file:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/drishti?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

## Database Setup

### Install Dependencies

Dependencies are already included in package.json:
- `mongoose` - MongoDB ODM
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT authentication

### Seed Initial Data

Run the seeding script to populate your database with sample data:

```bash
npm run seed
```

This will create:
- Sample entrepreneur and investor accounts
- Sample startup ideas
- Sample notifications

### Sample Accounts

After seeding, you can log in with these accounts:

**Entrepreneurs:**
- Email: `sarah@example.com` / Password: `password123`
- Email: `john@example.com` / Password: `password123`

**Investors:**
- Email: `michael@techventures.com` / Password: `password123`
- Email: `lisa@greencapital.com` / Password: `password123`

## Database Schema

### Collections

1. **users** - User accounts (entrepreneurs and investors)
2. **ideas** - Startup idea submissions
3. **notifications** - User notifications

### Key Features

- **Authentication**: JWT-based with password hashing
- **Role-based Access**: Separate features for entrepreneurs and investors
- **Real-time Scoring**: AI scoring algorithm for startup ideas
- **Engagement Tracking**: Views, interests, and interactions

## Development Commands

```bash
# Start development server with MongoDB
npm run dev

# Run database seeding
npm run seed

# Type checking
npm run typecheck

# Build for production
npm run build
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Ideas
- `GET /api/ideas` - Get all ideas (investors)
- `GET /api/ideas/my-ideas` - Get user's ideas (entrepreneurs)
- `POST /api/ideas` - Create new idea
- `PUT /api/ideas/:id` - Update idea
- `POST /api/ideas/:id/interest` - Express interest

### Notifications
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/mark-all-read` - Mark all as read

## Production Deployment

### Environment Variables

Ensure these are set in production:

```env
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=a-very-secure-random-string
NODE_ENV=production
```

### Security Considerations

1. Use strong JWT secrets in production
2. Enable MongoDB authentication
3. Use environment variables for sensitive data
4. Implement rate limiting for API endpoints
5. Use HTTPS in production

## Troubleshooting

### Common Issues

1. **Connection Error**: Ensure MongoDB is running and connection string is correct
2. **Authentication Error**: Check username/password in connection string
3. **Network Error**: For Atlas, ensure IP is whitelisted

### MongoDB Logs

**Local MongoDB:**
```bash
# macOS
tail -f /usr/local/var/log/mongodb/mongo.log

# Ubuntu
sudo tail -f /var/log/mongodb/mongod.log
```

### Application Logs

The server will log MongoDB connection status:
- ✅ MongoDB connected successfully
- ❌ MongoDB connection error

## Next Steps

1. Set up your MongoDB instance (local or Atlas)
2. Configure environment variables
3. Run the seeding script
4. Start the development server
5. Test with sample accounts

The application will automatically create the database schema and handle migrations through Mongoose models.
