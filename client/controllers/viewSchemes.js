/**
 * Scheme viewer controller, for template embedded in dashboard.
 * Also contains controller for view schemes list items (cards) nested in template.
 * ESLint suppress no-new; that's how Clipboard works.
 */

/* eslint no-new: 0 */

import moment from 'moment';
import Clipboard from 'clipboard';

/**
 * Subscribe to schemes and marks data sources when created.
 * This allows the live updating of the dashboard schemes and marking figures.
 */
Template.viewSchemes.onCreated(function created() {
  const self = this;
  self.autorun(() => {
    self.subscribe('markingSchemes');
    self.subscribe('marks');
  });
});

/**
 * Template helpers.
 */
Template.viewSchemes.helpers({
  markingSchemes() {
    return MarkingSchemes.find({
      creator: Meteor.userId(),
    }, {
      sort: {
        unitCode: 1,
        name: 1,
      },
    });
  },
});

// View Schemes List Item Template Controller:

/**
 * Initialize Clipboard and Semantic UI components when template added to DOM.
 */
Template.viewSchemesListItem.onRendered(() => {
  $('.basic.button').popup({
    inline: false,
    position: 'top left',
  });
  const clipboard = new Clipboard('.copy-scheme-url');
  // Inform user if clipboard operation failed, so they can do it manually.
  // This happens in Safari currently (<9.1), but should work in upcoming versions.
  clipboard.on('error', () => {
    $('.ui.popup div.content').text('Browser error, copy the link from the mark page!');
  });
  clipboard.on('success', () => {
    $('.ui.popup div.content').text('Copied to clipboard!');
  });
});

Template.viewSchemesListItem.helpers({
  // Check if scheme is within the last day.
  recent() {
    return moment(this.createdAt).isAfter(moment().startOf('day'));
  },
  // Shorten the description to 100 chars to avoid clipping stats and add '...'.
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
  // zzNO_UNIT is a bit of a hack to allow MongoDB sorting to work as expected.
  // It's used when no Unit is given, so the schemes group at the end.
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

/**
 * Event listeners for list items / cards.
 */
Template.viewSchemesListItem.events({
  'click .card-delete-button'(event) {
    const schemeId = this._id;
    event.preventDefault();
    // Confirm deletion:
    $('.ui.basic.delete-check.modal')
      .modal({
        closable: false,
        onApprove() {
          Meteor.call('deleteScheme', schemeId);
        },
        detachable: false,
      }).modal('show');
  },
  // Don't go to the URL!
  'click .copy-scheme-url'(event) {
    event.preventDefault();
  },
});
