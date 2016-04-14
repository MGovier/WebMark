/**
 * Activity view controller and data.
 * ESLint new-cap supressed due to ReactiveFromNow package.
 */

/* eslint new-cap: 0 */

import { ReactiveFromNow } from 'meteor/glasser:reactive-fromnow';
import { Activities } from '../../lib/data.js';

Template.activityView.onCreated(function created() {
  const self = this;
  self.autorun(() => {
    self.subscribe('activities');
  });
});

Template.activityView.helpers({
  activities() {
    const activity = Activities.find({
      relevantTo: Meteor.userId(),
    }, {
      sort: {
        performedAt: -1,
      },
      limit: 3,
    });
    return activity;
  },
  friendlyDate(date) {
    return ReactiveFromNow(date);
  },
  icon(type) {
    if (type === 'new') {
      return 'certificate';
    }
    if (type === 'edit') {
      return 'configure';
    }
    return 'pencil';
  },
});
