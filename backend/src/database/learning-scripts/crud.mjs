/* eslint-disable no-undef */
import createConnectionPool, {sql} from '@databases/pg';

const db = createConnectionPool(
  'postgres://test-user@localhost:5432/test-db',
);

async function insertUser(email, favoriteColor) {
    await db.query(sql`
      INSERT INTO users (email, favorite_color)
      VALUES (${email}, ${favoriteColor})
    `);
  }
  
  async function updateUser(email, favoriteColor) {
    await db.query(sql`
      UPDATE users
      SET favorite_color=${favoriteColor}
      WHERE email=${email}
    `);
  }
  
  async function deleteUser(email) {
    await db.query(sql`
      DELETE FROM users
      WHERE email=${email}
    `);
  }
  
  async function getUser(email) {
    const users = await db.query(sql`
      SELECT * FROM users
      WHERE email=${email}
    `);
    if (users.length === 0) {
      return null;
    }
    return users[0];
  }
  async function run() {
    await insertUser('me@example.com', 'red');
    await updateUser('me@example.com', 'blue');
  
    const user = await getUser('me@example.com');
    console.log('user =', user);
  
    await deleteUser('me@example.com');
  
    await db.dispose();
  }
  
  run().catch((err) => {
    console.error(err);
    process.exit(1);
  });
  