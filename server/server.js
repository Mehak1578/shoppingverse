const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const path = require('path')
const connectDB = require('./config/db')

// Load server/.env first, then fall back to project root .env if values missing
dotenv.config()
if (!process.env.MONGODB_URI) {
	const rootEnv = path.resolve(__dirname, '..', '.env')
	dotenv.config({ path: rootEnv })
}

const app = express()
app.use(cors())
app.use(express.json())

// Connect to MongoDB
connectDB()

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '..', 'client', 'public')))

// Routes
// Extra CORS headers (explicit) - ensure deployed servers return required CORS headers
app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*')
	res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
	res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
	if (req.method === 'OPTIONS') return res.sendStatus(200)
	next()
})

app.use('/api/auth', require('./routes/authRoutes'))
app.use('/api/products', require('./routes/productRoutes'))
app.use('/api/orders', require('./routes/orderRoutes'))

app.get('/', (req, res) => res.json({ message: 'Welcome to Shopverse API' }))

// Start server on the port provided by Render (or 5000 for local dev)
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})
