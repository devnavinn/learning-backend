// eslint-disable-next-line import/no-extraneous-dependencies
const mongoose = require('mongoose');

const dotenv = require('dotenv');

const app = require('./app');


dotenv.config({ path: './config.env' });


mongoose.connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(() => {
    console.log('DB connection successful!');
})

// Listen
const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log(`App is running on port ${port}`);
});
