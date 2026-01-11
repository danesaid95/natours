// eslint-disable-next-line import/no-extraneous-dependencies
const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log('Uncaught Exception! 🚨 shutting down the server....');
  console.log(err.name, err.message);

  process.exit(1);
});

dotenv.config({ path: './config.env' });

const app = require('./app');

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

// console.log(process.env);
const port = process.env.PORT || 3008;

//Start Server
const server = app.listen(port, () => {
  console.log(`App is running ${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log('Unhandled Rejection! 🚨 shutting down the server....');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
