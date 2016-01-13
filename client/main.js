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

Template.markScheme.onRendered(() => {
  $('.ui.checkbox').checkbox();
});

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

Template.viewSchemes.helpers({

});

Template.viewSchemesListItem.helpers({
  friendlyDate: function () {
    return moment(this.createdAt).fromNow();
  },
  recent: function () {
    return moment(this.createdAt).isAfter(moment().startOf('day'));
  },
  trimmedDescription: function () {
    if (this.description.length > 80) {
      return this.description.substring(0, 80) + '...';
    } else {
      return this.description;
    }
  },
  aspectsAndComments: function () {
    return this.aspects.length + this.comments.length;
  },
  markedReports: function () {
    // get the count using this._id
    return 0;
  },
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
