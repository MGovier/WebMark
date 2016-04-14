/**
 * Database event hooks.
 * These are called on certain update, insertion, or removal events.
 */

import exampleScheme from './lib/exampleScheme.json';
import exampleMarks from './lib/exampleMarks.json';

import { Activities, MarkingSchemes, Marks } from '../lib/data.js';

/**
 * Remove older activity entries when a new one is added.
 */
Activities.after.insert((userId) => {
  const log = Activities.find({ relevantTo: userId }, { sort: { performedAt: 1 } });
  const array = log.fetch();
  const count = log.count();
  for (let i = 0, len = count - 5; i < len; ++i) {
    Activities.remove(array[i]._id);
  }
});

/**
 * Create an example marking scheme, with marks, for a new user.
 */
Meteor.users.after.insert((userId, doc) => {
  // Customise examples for current user and time.
  exampleScheme.creator = doc._id;
  exampleScheme.createdAt = new Date();
  MarkingSchemes.insert(exampleScheme, {
    bypassCollection2: true,
  }, (err, id) => {
    if (err) {
      Meteor.error(err);
    }
    for (const i in exampleMarks) {
      if (exampleMarks.hasOwnProperty(i)) {
        exampleMarks[i].schemeId = id;
        exampleMarks[i].schemeOwner = doc._id;
        exampleMarks[i].createdAt = new Date();
        Marks.insert(exampleMarks[i], {
          bypassCollection2: true,
        }, error => {
          if (error) {
            Meteor.error(error);
          }
        });
      }
    }
  });
});
