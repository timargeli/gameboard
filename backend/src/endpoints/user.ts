import { Endpoint } from '../types'
import { db, usersTable } from '../database/database'

// POST: Add a new user
export const userEndpoints: Endpoint[] = [
  {
    endpointType: 'post',
    path: '/users/create',
    handler: async (req, res) => {
      try {
        const { name, password, language } = req.body
        if (!name) {
          throw new Error('Név megadása kötelező')
        }
        if (!password) {
          throw new Error('Jelszó megadása kötelező')
        }
        // Checking for an existing user with this name
        const existingUser = await usersTable(db).findOne({ name })
        if (existingUser?.password && existingUser.password !== password) {
          throw new Error('Helytelen jelszó')
        }
        let newUser
        // Creating a new one if nothing has been found
        if (!existingUser) {
          ;[newUser] = await usersTable(db).insert({ name, password, language })
        }
        res
          .status(201)
          .json(
            existingUser
              ? { message: 'Found an user with this name', user: existingUser }
              : { message: 'Created new user', user: newUser },
          )
      } catch (error) {
        console.log('Error creating user')
        console.log(error)
        res.status(500).json({ message: 'Error creating user', error: (error as any)?.message })
      }
    },
  },
]
