const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'student.veleri.hr',
  user: process.env.DB_USER || 'etangar',
  port: process.env.DB_PORT || 3306 ,
  password: process.env.DB_PASSWORD || '11',
  database: process.env.DB_NAME || 'etangar',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

// Test connection
pool.getConnection()
  .then(connection => {
    console.log('Database connected successfully');
    connection.release();
  })
  .catch(err => {
    console.error('Database connection failed:', err);
  });

module.exports = pool;