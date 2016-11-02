
exports.up = function(knex, Promise) {
  return knex.schema.createTableIfNotExists('photos', (table) => {
    table.increments();
    table.bigInteger('facebook_photo_id');
    table.bigInteger('users_facebook_id');
    table.foreign('users_facebook_id').references('users.facebook_id');
    table.string('public_facebook_url');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists('photos');
};
