/**
 * Dashboard
 */
import { FlowRouter } from 'meteor/kadira:flow-router';
/**
 * Called when template added to the DOM.
* Redirects users to the landing page if they are not logged in.
 */
Template.dashboard.onCreated(function created() {
  const self = this;
  self.autorun(() => {
    if (!Meteor.userId()) {
      FlowRouter.go('landing');
    }
  });
});

Template.dashboard.helpers({
  firstName() {
    if (Meteor.user() && Meteor.user().profile) {
      return Meteor.user().profile.name.split(' ')[0];
    }
    return '';
  },
  connected() {
    return Meteor.status().connected;
  },
});

Template.dashboard.events({
  'click .new-scheme'() {
    FlowRouter.go('insertScheme');
  },
});
