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
      return sum;
    },
    {
      readOnly: true,
      //deferrable: true, // pg waits for safe run
      isolationLevel: IsolationLevel.SERIALIZABLE,
      retrySerializationFailures: true,
    },
  );
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
