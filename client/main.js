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

Template.main.events({
});

Template.viewSchemes.helpers({
});

Template.viewSchemesListItem.helpers({
  friendlyDate: function () {
    return moment(this.createdAt).fromNow();
  },
  recent: function () {
    return moment(this.createdAt).isAfter(moment().startOf('day'));
  }
});

Template.viewSchemesListItem.events({
  'click .delete-scheme': function (evt) {
    evt.preventDefault();
    console.log('deleting: ', this._id);
    Meteor.call('deleteScheme', this._id);
  },
  'click .edit-scheme': function (evt) {
    evt.preventDefault();
    window.alert('Coming soon!');
  }
});
