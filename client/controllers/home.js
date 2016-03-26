Template.home.onRendered(function render() {
  $('.right-perspective-overlay').transition('slide right in');
  $('.left-perspective-overlay').transition('slide left in');
  this.autorun(() => {
    if (Meteor.userId() && FlowRouter.current().path === '/') {
      FlowRouter.go('dashboard');
    }
  });
});

Template.home.events({
  'click .google-log-in'() {
    Meteor.loginWithGoogle();
  },
  'click .create-scheme'() {
    FlowRouter.go('insertScheme');
  },
  'click .view-schemes'() {
    FlowRouter.go('dashboard');
  },
});
