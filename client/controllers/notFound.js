/**
 * Not found template controller.
 */
import { Meteor } from 'meteor/meteor';
/**
 * Delay showing the not found warning.
 * This is due to momentary gap after subs are ready that the variable is assigned.
 */
Template.notFound.onRendered(() => {
  Meteor.setTimeout(() => {
    $('.not-found').show();
  }, 200);
});
