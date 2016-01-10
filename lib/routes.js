Router.configure({
  layoutTemplate: 'main',
  loadingTemplate: 'loading'
});

var OnBeforeActions;

OnBeforeActions = {
    loginRequired: function() {
      if (!Meteor.userId()) {
        this.render('home');
      } else {
        this.next();
      }
    }
};

Router.onBeforeAction(OnBeforeActions.loginRequired, {
    only: ['insertScheme', 'viewSchemes']
});

Router.route('/', {
  template: 'home',
  name: 'home'
});

Router.route('/newScheme', {
  template: 'insertScheme',
  name: 'insertScheme'
});

Router.route('/viewSchemes', {
  template: 'viewSchemes',
  name: 'viewSchemes',
  waitOn: function() {
    return Meteor.subscribe('markingSchemes');
  },
  data: function () {
    let templateData = {markingSchemes: MarkingSchemes.find({}, {sort: {name: 1}})};
    return templateData;
  }
});

Router.route('/mark/:_id', {
  name: 'markScheme',
  template: 'markScheme',
  waitOn: function() {
    return Meteor.subscribe('markingSchemes');
  },
  data: function () {
    return MarkingSchemes.findOne({_id: this.params._id});
  }
});