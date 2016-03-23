FlowRouter.route('/', {
  name: 'landing',
  action() {
    if (Meteor.userId()) {
      FlowRouter.go('dashboard');
    } else {
      BlazeLayout.render('main', { content: 'home' });
      document.title = 'WebMark';
    }
  },
});

FlowRouter.route('/home', {
  name: 'home',
  action() {
    BlazeLayout.render('main', { content: 'home' });
    document.title = 'WebMark';
  },
});

FlowRouter.route('/newScheme', {
  name: 'insertScheme',
  action() {
    BlazeLayout.render('main', { content: 'insertScheme' });
    document.title = 'WebMark New Scheme';
  },
});

FlowRouter.route('/editScheme/:_id', {
  name: 'editScheme',
  action() {
    BlazeLayout.render('main', { content: 'editScheme' });
    document.title = 'WebMark Edit Scheme';
  },
});

FlowRouter.route('/dashboard', {
  name: 'dashboard',
  action() {
    if (Meteor.userId()) {
      BlazeLayout.render('main', { content: 'dashboard' });
      document.title = 'WebMark Dashboard';
    } else {
      FlowRouter.go('landing');
    }
  },
});

FlowRouter.route('/mark/:_id', {
  name: 'markScheme',
  action() {
    BlazeLayout.render('main', { content: 'markScheme' });
    document.title = 'WebMark Marking';
  },
});

FlowRouter.route('/marks/:_id', {
  name: 'marks',
  template: 'marks',
  action() {
    BlazeLayout.render('main', { content: 'marks' });
    document.title = 'WebMark View Marks';
  },
});

FlowRouter.route('/markReport/:_sid/:_id', {
  name: 'markReport',
  action() {
    BlazeLayout.render('main', { content: 'markingReport' });
    document.title = 'WebMark Marking Report';
  },
});

FlowRouter.notFound = {
  action() {
    BlazeLayout.render('main', { content: 'notFound' });
    document.title = 'Whoops!';
  },
};

function clearTooltips() {
  $('body>.ui.popup').transition('scale out');
  $('body>.ui.popup').remove();
}

FlowRouter.triggers.enter([clearTooltips]);
