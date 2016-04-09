/**
 * Helper functions available to all templates.
 */

/**
 * Only display loading when we have server connection.
 * Otherwise we use local data which we don't need to wait for.
 */
Template.registerHelper('connectionReady', () =>
  Template.instance().subscriptionsReady() || !Meteor.status().connected);
