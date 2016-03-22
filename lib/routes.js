Router.configure({
  layoutTemplate: 'main',
  loadingTemplate: 'loading',
  notFoundTemplate: 'notFound',
});

const OnBeforeActions = {
  loginRequired() {
    if (!Meteor.userId()) {
      Router.go('home');
    } else {
      this.next();
    }
  },
};

Router.onBeforeAction(OnBeforeActions.loginRequired, {
  only: ['insertScheme', 'editScheme', 'dashboard', 'marks'],
});


const OnAfterActions = {
  clearTooltips() {
    $('body>.ui.popup').transition('scale out');
    $('body>.ui.popup').remove();
  },
};

Router.onAfterAction(OnAfterActions.clearTooltips);

Router.route('/', {
  template: 'home',
  name: 'landing',
  onBeforeAction() {
    if (Meteor.userId()) {
      Router.go('dashboard');
    } else {
      this.next();
    }
  },
  onAfterAction() {
    document.title = 'WebMark';
  },
});

Router.route('/home', {
  template: 'home',
  name: 'home',
  onAfterAction() {
    document.title = 'WebMark';
  },
});

Router.route('/newScheme', {
  template: 'insertScheme',
  name: 'insertScheme',
  waitOn() {
    if (Meteor.status().connected) {
      return Meteor.subscribe('units');
    }
    this.render();
  },
  data() {
    const units = Units.findOne({});
    return units;
  },
  onAfterAction() {
    document.title = 'WebMark New Scheme';
  },
});

Router.route('/editScheme/:_id', {
  template: 'editScheme',
  name: 'editScheme',
  waitOn() {
    if (Meteor.status().connected) {
      return [Meteor.subscribe('units'),
        Meteor.subscribe('markingSchemes', this.params._id)];
    }
    this.render();
  },
  data() {
    const templateData = {
      scheme: MarkingSchemes.findOne({}),
      units: Units.findOne({}),
    };
    return templateData;
  },
  onAfterAction() {
    document.title = 'WebMark Edit Scheme';
  },
});

Router.route('/dashboard', {
  template: 'dashboard',
  name: 'dashboard',
  waitOn() {
    if (Meteor.status().connected) {
      return [Meteor.subscribe('markingSchemes'),
        Meteor.subscribe('marks'), Meteor.subscribe('activities')];
    }
    this.render();
  },
  data() {
    const templateData = {
      markingSchemes: MarkingSchemes.find({}, {
        sort: {
          unitCode: 1,
          name: 1,
        },
      }),
      marks: Marks.find({}),
      activities: Activities.find({}, {
        sort: {
          performedAt: -1,
        },
        limit: 3,
      }),
    };
    return templateData;
  },
  onAfterAction() {
    document.title = 'WebMark Dashboard';
  },
});

Router.route('/mark/:_id', {
  name: 'markScheme',
  template: 'markScheme',
  waitOn() {
    if (Meteor.status().connected) {
      return Meteor.subscribe('markingSchemes', this.params._id);
    }
    this.render();
  },
  data() {
    const scheme = MarkingSchemes.findOne({
      _id: this.params._id,
    });
    if (!scheme) {
      this.render('notFound');
    } else {
      return scheme;
    }
  },
  onAfterAction() {
    document.title = 'WebMark Marking';
  },
});

Router.route('/marks/:_id', {
  name: 'marks',
  template: 'marks',
  waitOn() {
    if (Meteor.status().connected) {
      return [Meteor.subscribe('markingSchemes', this.params._id),
        Meteor.subscribe('marks', null, this.params._id)];
    }
    this.render();
  },
  data() {
    const dataObj = {
      markingScheme: MarkingSchemes.findOne({
        _id: this.params._id,
      }),
      marks: Marks.find({
        schemeId: this.params._id,
      }),
    };
    if (!dataObj.markingScheme) {
      this.render('notFound');
    } else {
      return dataObj;
    }
  },
  onAfterAction() {
    document.title = 'WebMark View Marks';
  },
});

Router.route('/markReport/:_sid/:_id', {
  name: 'markReport',
  template: 'markingReport',
  waitOn() {
    if (Meteor.status().connected) {
      return [Meteor.subscribe('marks', this.params._id),
        Meteor.subscribe('markingSchemes', this.params._sid)];
    }
    this.render();
  },
  data() {
    const dataObj = {
      report: Marks.findOne({
        _id: this.params._id,
      }),
      scheme: MarkingSchemes.findOne({
        _id: this.params._sid,
      }),
    };
    if (!dataObj.scheme || !dataObj.report) {
      this.render('notFound');
    } else {
      return dataObj;
    }
  },
  onAfterAction() {
    document.title = 'WebMark Marking Report';
  },
});

Router.route('/(.*)', {
  template: 'notFound',
});
