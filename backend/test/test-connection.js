const sql = require('mssql');

const config = {
  server: 'SANOOF',
  database: 'MeenVandiDb',
  authentication: {
    type: 'default',
    options: {
      userName: 'NodeUser',   // SQL login
      password: 'NodePass123' // must match exactly
    }
  },
  options: {
    encrypt: false,
    trustServerCertificate: true,
    port: 1433
  }
};

sql.connect(config)
  .then(() => console.log('✅ Connected successfully!'))
  .catch(err => console.error('❌ Connection failed:', err));
