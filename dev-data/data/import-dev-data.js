const fs = require('fs');
const mongoose = require('mongoose');

const dotenv = require('dotenv');
const Tour = require('../../models/tourModel');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  // eslint-disable-next-line prettier/prettier
  process.env.DATABASE_PASSWORD,
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('DB connection successful!'));

const tours = JSON.parse(fs.readFileSync('dev-data/data/tours.json'));

//IMPORT DATA INTO COLLECTIONS
const importData = async () => {
  try {
    await Tour.create(tours, { validateBeforeSave: false });
    console.log('data successfully created!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

//IMPORT DELETE INTO COLLECTIONS
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('data successfully deleted!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
