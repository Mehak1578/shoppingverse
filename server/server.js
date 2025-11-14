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

// Start the server with a safe port fallback when the desired port is in use
const startServer = (port) => {
	const server = app.listen(port, () => console.log(`Server running on port ${port}`))

	server.on('error', (err) => {
		if (err && err.code === 'EADDRINUSE') {
			console.error(`Port ${port} is in use, trying ${port + 1}...`)
			setTimeout(() => startServer(port + 1), 200)
		} else {
			console.error('Server error:', err)
			process.exit(1)
		}
	})
}

const PORT = Number(process.env.PORT) || 5000
startServer(PORT)
