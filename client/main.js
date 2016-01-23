Meteor.startup(() => {
  $('html').attr('lang', 'en');
});

Template.main.onRendered(() => {
  $('.ui.menu .ui.dropdown').dropdown({
    on: 'hover'
  });
  $('.ui.menu .sign-in').popup({
    inline   : true,
    hoverable: true,
    position : 'bottom right',
    delay: {
      show: 100,
      hide: 800
    }
  });
});

Template.home.onRendered(() => {
  $('.right-perspective-overlay').visibility({
    once       : false,
    continuous : true,
    offset: 500,
    onPassing  : function(calculations) {
      if (calculations.percentagePassed < 0.1) {
        $(this).css('opacity', 0.0);
      } else {
        $(this).css('opacity', calculations.percentagePassed);
      }
      $(this).css('top', (calculations.percentagePassed * 50));
    }
  });
  $('.left-perspective-overlay').visibility({
    once       : false,
    continuous : true,
    offset: 650,
    onPassing  : function(calculations) {
      if (calculations.percentagePassed < 0.1) {
        $(this).css('opacity', 0.0);
      } else {
        $(this).css('opacity', calculations.percentagePassed);
      }    
      $(this).css('top', (calculations.percentagePassed * 50));
    }
  });
});

Template.home.created = function() {
  let intervalA = Meteor.setInterval(function () {
    $('.right-perspective-overlay').visibility('refresh');
  }, 20);
  let intervalB = Meteor.setInterval(function () {
    $('.left-perspective-overlay').visibility('refresh');
  }, 20);
  Session.set('intervalTracker', [intervalA, intervalB]);
}

Template.home.destroyed = function() {
  let intervals = Session.get('intervalTracker');
  intervals.forEach((id) => {
    Meteor.clearInterval(id);
  })
}

Template.viewSchemes.onRendered(() => {
  $('.icon.button').popup({
    inline: false,
    position: 'top left'
  });
  new Clipboard('.copy-scheme-url');
});

Template.home.events({
  'click .google-log-in': function () {
    Meteor.loginWithGoogle();
  },
  'click .create-scheme': function () {
    Router.go('insertScheme');
  },
  'click .view-schemes': function () {
    Router.go('dashboard');
  }
});

Template.marks.created = function () {
  this.filter = new ReactiveTable.Filter('filter-table', []);
}

Template.dashboard.helpers({
  firstName: function () {
    return Meteor.user().profile.name.split(' ')[0];
  },
  connected: function () {
    return Meteor.status().connected;
  } 
});

Template.dashboard.events({
  'click .new-scheme': function () {
    Router.go('insertScheme');
  }
});

Template.activityView.helpers({
  friendlyDate: function (date) {
    return ReactiveFromNow(date);
  },
  icon: function (type) {
    if (type == 'new') {
      return 'certificate';
    } else {
      return 'pencil';
    }
  }
})

Template.viewSchemesListItem.helpers({
  recent: function () {
    return moment(this.createdAt).isAfter(moment().startOf('day'));
  },
  trimmedDescription: function () {
    if (this.description.length > 100) {
      return this.description.substring(0, 100) + '...';
    } else {
      return this.description;
    }
  },
  aspectsAndComments: function () {
    return this.aspects.length + this.comments.length;
  },
  markedReports: function () {
    return Marks.find({schemeId: this._id}).count();
  },
  hashbangURL: function (url, path) {
    let pathNoSlash = path.substring(1),
        rootUrl = url.replace(pathNoSlash, '#!');
    return rootUrl + pathNoSlash;
  },
  showUnitYear: function () {
    if (this.unitCode && this.unitCode !== 'zzNO_UNIT') {
      return this.unitCode + ' ' + moment(this.createdAt).format('YYYY');
    } else {
      return moment(this.createdAt).format('MMM YYYY');
    }   
  }
});

Template.viewSchemesListItem.events({
  'click .card-delete-button': function (evt) {
    let schemeId = this._id;
    evt.preventDefault();
    $('.ui.basic.delete-check.modal')
      .modal({
        closable  : false,
        onApprove : function() {
          Meteor.call('deleteScheme', schemeId);
        },
        detachable: false
      }).modal('show');    
  },
  'click .edit-scheme': function (evt) {
    evt.preventDefault();
    window.alert('Coming soon!');
  },
  'click .copy-scheme-url': function (evt) {
    evt.preventDefault();
    $('.ui.popup div.content').text('Copied to clipboard!'); 
  }
});

Template.marks.helpers({
  settings: function () {
    return {
      collection: Template.instance().data.marks,
      rowsPerPage: 40,
      filters: ['filter-table'],
      class: 'ui table striped selectable',
      fields: [
        {key: 'studentNo', label: 'Student No.'},
        {key: 'marker', label: 'Marked By'},
        {key: 'createdAt', label: 'Marked At', fn: function (value) { return moment(value).format('llll');}},
        {key: 'marks', label: 'Mark'},
        {key: 'percentage', label: 'Percentage', fn: function (value, object) { return Math.round((object.marks / object.maxMarks) * 100);}}
        ]
    };
  }
});

Template.marks.events({
  'click .reactive-table tbody tr': function (evt, template) {
    Router.go('markReport', {_id:this._id, _sid: template.data.markingScheme._id});
  },
  'keyup #filter-table': function (evt, template) {
    template.filter.set($(evt.currentTarget).val())
  }
});

Template.markingReport.helpers({
  'percentage': function (mark, total) {
    return Math.round((mark/total) * 100);
  },
  'showAdj': function (value) {
    if (value > 0) {
      return '+' + value;
    } else {
      return value;
    }
  }
});
