Template.viewSchemes.onRendered(() => {
  $('.basic.button').popup({
    inline: false,
    position: 'top left'
  });
  new Clipboard('.copy-scheme-url');
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
  'click .copy-scheme-url': function(evt) {
    evt.preventDefault();
    $('.ui.popup div.content').text('Copied to clipboard!');
  }
});
