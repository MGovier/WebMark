/**
 * Homepage controller.
 */

import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';

Template.home.onRendered(function render() {
  $('.right-perspective-overlay').transition('slide right in');
  $('.left-perspective-overlay').transition('slide left in');
  this.autorun(() => {
    // Don't redirect from home, only landing... They might want to be there!
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
