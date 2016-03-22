/* eslint new-cap: 0 */

Template.dashboard.helpers({
  firstName() {
    if (Meteor.userId()) {
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
    Router.go('insertScheme');
  },
});

Template.activityView.helpers({
  friendlyDate(date) {
    return ReactiveFromNow(date);
  },
  icon(type) {
    if (type === 'new') {
      return 'certificate';
    }
    return 'pencil';
  },
});
