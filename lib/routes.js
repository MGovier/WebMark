Router.configure({
  layoutTemplate: 'main',
  loadingTemplate: 'loading'
});

var OnBeforeActions;

OnBeforeActions = {
  loginRequired: function() {
    if (!Meteor.userId()) {
      Router.go('home');
    } else {
      this.next();
    }
  }
};

Router.onBeforeAction(OnBeforeActions.loginRequired, {
    only: ['insertScheme', 'dashboard', 'marks']
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
  waitOn: function () {
    return [Meteor.subscribe('markingSchemes'), Meteor.subscribe('marks')];
  },
  data: function () {
    let templateData = {markingSchemes: MarkingSchemes.find({}, {sort: {name: 1}}), marks: Marks.find({})};
    return templateData;
  }
});

Router.route('/mark/:_id', {
  name: 'markScheme',
  template: 'markScheme',
  waitOn: function () {
    return Meteor.subscribe('markingSchemes', this.params._id);
  },
  data: function () {
    return MarkingSchemes.findOne({_id: this.params._id});
  }
});

Router.route('/marks/:_id', {
  name: 'marks',
  template: 'marks',
  waitOn: function () {
    return [Meteor.subscribe('markingSchemes', this.params._id), Meteor.subscribe('marks')];
  },
  data: function () {
    return {markingScheme: MarkingSchemes.findOne({_id: this.params._id}), marks: Marks.find({schemeId: this.params._id})};
  }
});

Router.route('/markReport/:_sid/:_id', {
  name: 'markReport',
  template: 'markingReport',
  waitOn: function () {
    return [Meteor.subscribe('marks', this.params._id), Meteor.subscribe('markingSchemes', this.params._sid)];
  },
  data: function () {
    return {report: Marks.findOne({_id: this.params._id}), scheme: MarkingSchemes.findOne({_id: this.params._sid})};
  }
})
