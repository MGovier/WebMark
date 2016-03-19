Template.dashboard.helpers({
  firstName: function() {
    if (Meteor.userId()) {
      return Meteor.user().profile.name.split(' ')[0];
    } else {
      return '';
    }
  },
  connected: function() {
    return Meteor.status().connected;
  }
});

Template.dashboard.events({
  'click .new-scheme': function() {
    Router.go('insertScheme');
  }
});

Template.activityView.helpers({
  friendlyDate: function(date) {
    return ReactiveFromNow(date);
  },
  icon: function(type) {
    if (type === 'new') {
      return 'certificate';
    } else {
      return 'pencil';
    }
  }
});
