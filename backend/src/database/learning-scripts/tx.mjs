/* eslint-disable no-undef */
import createConnectionPool, {sql} from '@databases/pg';

const db = createConnectionPool(
  'postgres://test-user@localhost:5432/test-db',
);

async function run() {
    const total = await db.tx(async (db) => {
      const resultA = await db.query(sql`
        SELECT 1 + 1 as result;
      `);
      const resultB = await db.query(sql`
        SELECT 20 + 20 as result;
      `);
      return resultA[0].result + resultB[0].result;
    });
  
    console.log(total);
    // => 42
    await db.dispose();
  }
  
  run().catch((err) => {
    console.error(err);
    process.exit(1);
  });
  