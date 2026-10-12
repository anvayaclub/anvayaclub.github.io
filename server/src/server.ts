import { app } from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`  ANVAYA Cultural Committee API Server`);
    console.log(`  Kalpataru Institute of Technology, Tiptur`);
    console.log(`  Listening on: http://localhost:${PORT}`);
    console.log(`  API Base URL: http://localhost:${PORT}/api`);
    console.log(`=======================================================`);
  });
};

startServer().catch(err => {
  console.error('Fatal error starting Anvaya server:', err);
});
