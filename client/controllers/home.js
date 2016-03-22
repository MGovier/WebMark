Template.home.onRendered(() => {
  $('.right-perspective-overlay').transition('slide right in');
  $('.left-perspective-overlay').transition('slide left in');
});

Template.home.events({
  'click .google-log-in'() {
    Meteor.loginWithGoogle();
  },
  'click .create-scheme'() {
    Router.go('insertScheme');
  },
  'click .view-schemes'() {
    Router.go('dashboard');
  },
});
