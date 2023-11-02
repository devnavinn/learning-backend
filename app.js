const express = require('express');

const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes')

const app = express()

//middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

app.use(express.json());
// This middleware parses JSON request bodies
app.use(express.urlencoded({ extended: true }));
// This middleware parses URL-encoded request bodies

app.use(express.static(`${__dirname}/public`))

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next()
})

app.get('/', (req, res) => {
    res.status(200)
        .json({ message: 'hello from server port 8000', app: 'nodejs' })
})

// routes
app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)

module.exports = app;

