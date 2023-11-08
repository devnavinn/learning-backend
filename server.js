// eslint-disable-next-line import/no-extraneous-dependencies
const mongoose = require('mongoose');

const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const app = require('./app');



const DB = process.env.DATABASE;
mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(() => {
    console.log('DB connection successful!');
}).catch(err => {
    console.log(err);
})

// Listen
const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log(`App is running on port ${port}`);
});
