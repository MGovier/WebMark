Router.configure({
  layoutTemplate: 'main',
  loadingTemplate: 'loading',
  notFoundTemplate: 'notFound'
});

var OnBeforeActions;

OnBeforeActions = {
  loginRequired: function() {
    if (!Meteor.userId()) {
      Router.go('home');
    } else {
      this.next();
    }
  },
};

Router.onBeforeAction(OnBeforeActions.loginRequired, {
    only: ['insertScheme', 'dashboard', 'marks']
});


OnAfterActions = {
  clearPopups: function () {
    $('body>.ui.popup').transition('scale out');
    $('body>.ui.popup').remove();
  }
};

Router.onAfterAction(OnAfterActions.clearPopups);

Router.route('/', {
  template: 'home',
  name: 'home',
  onBeforeAction: function () {
    if (Meteor.userId()) {
      Router.go('dashboard');
    } else {
      this.next();
    }
  },
  onAfterAction: function () {
    document.title = 'WebMark';
  }
});

Router.route('/newScheme', {
  template: 'insertScheme',
  name: 'insertScheme',
  waitOn: function () {
    if(Meteor.status().connected) {
      return Meteor.subscribe('units');
    } else {
      this.render();
    }
  },
  data: function () {
    let units = Units.findOne({});
    return units;
  },
  onAfterAction: function () {
    document.title = 'WebMark New Scheme';
  }
});

Router.route('/dashboard', {
  template: 'dashboard',
  name: 'dashboard',
  waitOn: function () {
    if(Meteor.status().connected) {
      return [Meteor.subscribe('markingSchemes'), Meteor.subscribe('marks'), Meteor.subscribe('activities')];
    } else {
      this.render();
    }
  },
  data: function () {
    let templateData = {
      markingSchemes: MarkingSchemes.find({}, {sort: {unitCode: 1}}),
      marks: Marks.find({}),
      activities: Activities.find({}, {sort:{performedAt: -1}, limit: 3})
    }
    return templateData;
  },
  onAfterAction: function () {
    document.title = 'WebMark Dashboard';
  }
});

Router.route('/mark/:_id', {
  name: 'markScheme',
  template: 'markScheme',
  waitOn: function () {
    if(Meteor.status().connected) {
      return Meteor.subscribe('markingSchemes', this.params._id);
    } else {
      this.render();
    }
  },
  data: function () {
    let scheme = MarkingSchemes.findOne({_id: this.params._id});
    if (!scheme) {
      this.render('notFound');
    } else {
      return scheme;
    }
  },
  onAfterAction: function () {
    document.title = 'WebMark Marking';
  }
});

Router.route('/marks/:_id', {
  name: 'marks',
  template: 'marks',
  waitOn: function () {
    if(Meteor.status().connected) {
      return [Meteor.subscribe('markingSchemes', this.params._id), Meteor.subscribe('marks')];
    } else {
      this.render();
    }
  },
  data: function () {
    let dataObj = {markingScheme: MarkingSchemes.findOne({_id: this.params._id}), marks: Marks.find({schemeId: this.params._id})};
    if (!dataObj.markingScheme) {
      this.render('notFound');
    } else {
      return dataObj;
    }
  },
  onAfterAction: function () {
    document.title = 'WebMark View Marks';
  }
});

Router.route('/markReport/:_sid/:_id', {
  name: 'markReport',
  template: 'markingReport',
  waitOn: function () {
    if(Meteor.status().connected) {
      return [Meteor.subscribe('marks', this.params._id), Meteor.subscribe('markingSchemes', this.params._sid)];
    } else {
      this.render();
    }
  },
  data: function () {
    let dataObj = {report: Marks.findOne({_id: this.params._id}), scheme: MarkingSchemes.findOne({_id: this.params._sid})};
    if (!dataObj.scheme || !dataObj.report) {
      this.render('notFound');
    } else {
      return dataObj;
    }
  },
  onAfterAction: function () {
    document.title = 'WebMark Marking Report';
  }
});

Router.route('/(.*)', {
  template: 'notFound'
});
