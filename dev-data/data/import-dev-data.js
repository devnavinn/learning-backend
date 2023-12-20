// eslint-disable-next-line import/no-extraneous-dependencies
const fs = require('fs')
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../../models/tourModel');

dotenv.config({ path: './config.env' });

mongoose.connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(() => {
    console.log('DB connection successful!');
})


//Read json file
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));

//Import data into db
const importData = async () => {
    try {
        await Tour.create(tours);
        console.log('Data successfully loaded!');

    } catch (err) {
        console.log(err);
    }
    process.exit();
}

//delete all data from collection
const deleteData = async () => {
    try {
        await Tour.deleteMany();
        console.log('Data successfully deleted!');

    } catch (err) {
        console.log(err);
    }
    process.exit();
}
if (process.argv[2] === '--import') {
    console.log('add', process.argv[2]);
    importData();
}
if (process.argv[2] === '--delete') {
    console.log('delete', process.argv[2])
    deleteData();
}
console.log(process.argv)