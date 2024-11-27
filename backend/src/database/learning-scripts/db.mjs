/* eslint-disable no-undef */
import createConnectionPool, {sql} from '@databases/pg';

const db = createConnectionPool(
  'postgres://postgres:123@localhost:5432/gameboard',
);
async function run() {
  await db.query(sql`
    INSERT INTO "user" (id, name, password)
    VALUES (1, 'Tim', '123')
  `);

  await db.dispose();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
