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
    only: ['insertScheme', 'dashboard']
});

Router.route('/', {
  template: 'home',
  name: 'home',
  onBeforeAction: function () {
    if (Meteor.userId()) {
      Router.go('dashboard');
    } else {
      this.next();
    }
  }
});

Router.route('/newScheme', {
  template: 'insertScheme',
  name: 'insertScheme'
});

Router.route('/dashboard', {
  template: 'dashboard',
  name: 'dashboard',
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
    return Meteor.subscribe('markingSchemes', this.params._id);
  },
  data: function () {
    return MarkingSchemes.findOne({_id: this.params._id});
  }
});