
exports.up = function(knex, Promise) {
  return knex.schema.createTableIfNotExists('positive_matches', function(table){
    table.increments();
    table.bigInteger('facebook_id');
    table.string('display_name');
    table.string('profile_pic');
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists('positive_matches');
};
