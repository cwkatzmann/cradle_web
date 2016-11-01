
exports.up = function(knex, Promise) {
  return knex.schema.createTableIfNotExists('users', function(table){
    table.increments();
    table.bigInteger('facebook_id');
    table.string('display_name');
    table.string('profile_pic');
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists('users');
};
