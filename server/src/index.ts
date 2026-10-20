import app from './app';
import { connectDB } from './config/db';
import env from './config/env';

async function main() {
  await connectDB();

  app.listen(env.PORT, () => {
    console.log(`🍰 SoulTalk Pastry API running on port ${env.PORT}`);
    console.log(`   Environment: ${env.NODE_ENV}`);
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
