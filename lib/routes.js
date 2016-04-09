/**
 * Routing configuration.
 * Controls the layouts and templates to be displayed on application routes.
 */

FlowRouter.route('/', {
  name: 'landing',
  action() {
    if (Meteor.userId()) {
      FlowRouter.go('dashboard');
    } else {
      BlazeLayout.render('landing', { content: 'home' });
      document.title = 'WebMark';
    }
  },
});

FlowRouter.route('/home', {
  name: 'home',
  action() {
    BlazeLayout.render('landing', { content: 'home' });
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

// If the URL did not match any pattern:
FlowRouter.notFound = {
  action() {
    BlazeLayout.render('main', { content: 'notFound' });
    document.title = 'Whoops!';
  },
};

/**
 * Remove any left over tooltip popups from the DOM.
 */
function clearTooltips() {
  $('body>.ui.popup').transition('scale out');
  $('body>.ui.popup').remove();
}

// Clear tooltips when route changes.
FlowRouter.triggers.enter([clearTooltips]);
