
exports.up = function(knex, Promise) {
  return knex.schema.table('users', function(table){
    table.unique('facebook_id');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('users', function(table){
    table.dropUnique('facebook_id');
  });
};
