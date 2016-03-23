/**
 * Scheme viewer, embedded in dashboard.
 * ESLint suppress no-new; that's how Clipboard works!
 */

/* eslint no-new: 0 */

import moment from 'moment';
import Clipboard from 'clipboard';

Template.viewSchemes.onCreated(function created() {
  const self = this;
  self.autorun(() => {
    self.subscribe('markingSchemes');
    self.subscribe('marks');
  });
});

Template.viewSchemes.helpers({
  markingSchemes() {
    return MarkingSchemes.find({}, {
      sort: {
        unitCode: 1,
        name: 1,
      },
    });
  },
});

Template.viewSchemesListItem.onRendered(() => {
  $('.basic.button').popup({
    inline: false,
    position: 'top left',
  });
  new Clipboard('.copy-scheme-url');
});

Template.viewSchemesListItem.helpers({
  recent() {
    return moment(this.createdAt).isAfter(moment().startOf('day'));
  },
  trimmedDescription() {
    if (this.description.length > 100) {
      return `${this.description.substring(0, 100)}...`;
    }
    return this.description;
  },
  aspectsAndComments() {
    return this.aspects.length + this.comments.length;
  },
  markedReports() {
    return Marks.find({
      schemeId: this._id,
    }).count();
  },
  showUnitYear() {
    if (this.unitCode && this.unitCode !== 'zzNO_UNIT') {
      return `${this.unitCode} ${moment(this.createdAt).format('YYYY')}`;
    }
    return moment(this.createdAt).format('MMM YYYY');
  },
  createURL(id) {
    return FlowRouter.url('mark/:_id', { _id: id });
  },
});

Template.viewSchemesListItem.events({
  'click .card-delete-button'(event) {
    const schemeId = this._id;
    event.preventDefault();
    $('.ui.basic.delete-check.modal')
      .modal({
        closable: false,
        onApprove() {
          Meteor.call('deleteScheme', schemeId);
        },
        detachable: false,
      }).modal('show');
  },
  'click .copy-scheme-url'(event) {
    event.preventDefault();
    $('.ui.popup div.content').text('Copied to clipboard!');
  },
});
