/* eslint-disable no-undef */
import {IsolationLevel} from '@databases/pg';
import createConnectionPool, {sql} from '@databases/pg';

const db = createConnectionPool(
  'postgres://test-user@localhost:5432/test-db',
);

async function run() {
  await db.tx(
    async (db) => {
      const [{sum}] = await db.query(sql`
        SELECT SUM(value) as sum FROM my_table WHERE class=1
      `);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const resultB = await db.query(sql`
        INSERT INTO my_table (class, value) VALUES (2, ${sum})
      `);
    },
    {
      isolationLevel: IsolationLevel.SERIALIZABLE,
      retrySerializationFailures: true,
    },
  );
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});