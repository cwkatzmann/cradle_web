// Update with your config settings.

module.exports = {

  development: {
    client: 'pg',
    connection: {
      database: 'cradle_dev',
      host: 'localhost'
    }
  },
  test: {
    client: 'pg',
    connection: {
      database: 'cradle_test',
      host: 'localhost'
    }
  },


  production: {
    client: 'postgresql',
    connection: {
      database: 'my_db',
      user:     'username',
      password: 'password'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }

};
