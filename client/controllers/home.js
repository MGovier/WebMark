Template.home.onCreated(function() {
  let intervalA = Meteor.setInterval(function() {
    $('.right-perspective-overlay').visibility('refresh');
  }, 20);
  let intervalB = Meteor.setInterval(function() {
    $('.left-perspective-overlay').visibility('refresh');
  }, 20);
  Session.set('intervalTracker', [intervalA, intervalB]);
});

Template.home.onRendered(() => {
  $('.right-perspective-overlay').transition('slide right in');
  $('.left-perspective-overlay').transition('slide left in');
});

Template.home.onDestroyed(() => {
  let intervals = Session.get('intervalTracker');
  intervals.forEach((id) => {
    Meteor.clearInterval(id);
  });
});

Template.home.events({
  'click .google-log-in': function() {
    Meteor.loginWithGoogle();
  },
  'click .create-scheme': function() {
    Router.go('insertScheme');
  },
  'click .view-schemes': function() {
    Router.go('dashboard');
  }
});
