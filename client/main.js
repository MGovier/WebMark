Meteor.startup(() => {
  $('html').attr('lang', 'en');
  RouterAutoscroll.marginTop = 50;
  sAlert.config({
    position: 'top',
    effect: 'stackslide',
    html: true
  });
});

Template.main.onRendered(() => {
  $('.ui.menu .ui.dropdown').dropdown({
    on: 'hover'
  });
  $('.ui.menu .sign-in').popup({
    inline: true,
    hoverable: true,
    position: 'bottom right',
    delay: {
      show: 100,
      hide: 800
    }
  });
});

Template.home.onRendered(() => {
  $('.right-perspective-overlay').transition('slide right in');
  $('.left-perspective-overlay').transition('slide left in');
});

Template.home.created = function() {
  let intervalA = Meteor.setInterval(function() {
    $('.right-perspective-overlay').visibility('refresh');
  }, 20);
  let intervalB = Meteor.setInterval(function() {
    $('.left-perspective-overlay').visibility('refresh');
  }, 20);
  Session.set('intervalTracker', [intervalA, intervalB]);
};

Template.home.destroyed = function() {
  let intervals = Session.get('intervalTracker');
  intervals.forEach((id) => {
    Meteor.clearInterval(id);
  });
};

Template.viewSchemes.onRendered(() => {
  $('.basic.button').popup({
    inline: false,
    position: 'top left'
  });
  new Clipboard('.copy-scheme-url');
});

Template.navigation.helpers({
  activeIfTemplate: function(template) {
    var currentRoute = Router.current();
    return currentRoute && template ===
      currentRoute.lookupTemplate() ? 'active' : '';
  }
});

Template.home.events({
  'click .google-log-in': function() {
    Meteor.loginWithGoogle();
  },
  'click .create-scheme': function() {
    Router.go('insertScheme');
  },
  'click .view-schemes': function() {
    Router.go('dashboard');
  }
});

Template.dashboard.helpers({
  firstName: function() {
    if (Meteor.userId()) {
      return Meteor.user().profile.name.split(' ')[0];
    } else {
      return '';
    }
  },
  connected: function() {
    return Meteor.status().connected;
  }
});

Template.dashboard.events({
  'click .new-scheme': function() {
    Router.go('insertScheme');
  }
});

Template.activityView.helpers({
  friendlyDate: function(date) {
    return ReactiveFromNow(date);
  },
  icon: function(type) {
    if (type === 'new') {
      return 'certificate';
    } else {
      return 'pencil';
    }
  }
});

Template.viewSchemesListItem.helpers({
  recent: function() {
    return moment(this.createdAt).isAfter(moment().startOf('day'));
  },
  trimmedDescription: function() {
    if (this.description.length > 100) {
      return this.description.substring(0, 100) + '...';
    } else {
      return this.description;
    }
  },
  aspectsAndComments: function() {
    return this.aspects.length + this.comments.length;
  },
  markedReports: function() {
    return Marks.find({
      schemeId: this._id
    }).count();
  },
  hashbangURL: function(url, path) {
    let pathNoSlash = path.substring(1),
      rootUrl = url.replace(pathNoSlash, '#!');
    return rootUrl + pathNoSlash;
  },
  showUnitYear: function() {
    if (this.unitCode && this.unitCode !== 'zzNO_UNIT') {
      return this.unitCode + ' ' + moment(this.createdAt).format('YYYY');
    } else {
      return moment(this.createdAt).format('MMM YYYY');
    }
  }
});

Template.viewSchemesListItem.events({
  'click .card-delete-button': function(evt) {
    let schemeId = this._id;
    evt.preventDefault();
    $('.ui.basic.delete-check.modal')
      .modal({
        closable: false,
        onApprove: function() {
          Meteor.call('deleteScheme', schemeId);
        },
        detachable: false
      }).modal('show');
  },
  'click .edit-scheme': function(evt) {
    evt.preventDefault();
    window.alert('Coming soon!');
  },
  'click .copy-scheme-url': function(evt) {
    evt.preventDefault();
    $('.ui.popup div.content').text('Copied to clipboard!');
  }
});
