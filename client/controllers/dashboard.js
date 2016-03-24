/**
 * Dashboard
 */

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

Template.dashboard.onCreated(function created() {
  const self = this;
  self.autorun(() => {
    if (!Meteor.userId()) {
      FlowRouter.go('landing');
    }
  });
});
