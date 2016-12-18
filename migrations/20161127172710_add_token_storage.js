
exports.up = function(knex, Promise) {
  return knex.schema.table('users', function(table){
    table.string('access_token');
    table.string('refresh_token');
  })
};

exports.down = function(knex, Promise) {
 return knex.schema.table('users', function(table){
   table.dropColumn('access_token');
   table.dropColumn('refresh_token');
 })
};
