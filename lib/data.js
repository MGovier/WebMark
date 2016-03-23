/**
 * Data schemas and access control.
 */

/* eslint new-cap: 0 */

// Global collection references.
MarkingSchemes = new Mongo.Collection('markingSchemes');
Marks = new Mongo.Collection('marks');
Activities = new Mongo.Collection('activities');
Units = new Mongo.Collection('units');

// Allow offline storage of these database collections.
Ground.Collection(MarkingSchemes);
Ground.Collection(Marks);
Ground.Collection(Activities);
Ground.Collection(Units);

const Schemas = {};

// Marking scheme schema.
Schemas.Scheme = new SimpleSchema({
  _id: {
    type: String,
  },
  name: {
    type: String,
    optional: false,
  },
  creator: {
    type: String,
    optional: false,
    autoValue() {
      return this.userId;
    },
  },
  description: {
    type: String,
    optional: true,
  },
  unitCode: {
    type: String,
    optional: true,
    defaultValue: 'zzNO_UNIT',
  },
  createdAt: {
    type: Date,
  },
  aspects: {
    type: [Object],
  },
  'aspects.$.aspect': {
    type: String,
    optional: false,
  },
  'aspects.$.maxMark': {
    type: Number,
    optional: false,
    min: 0,
  },
  'aspects.$.rows': {
    type: [Object],
    minCount: 1,
  },
  'aspects.$.rows.$.criteriaValue': {
    type: Number,
    defaultValue: 0,
  },
  'aspects.$.rows.$.criteria': {
    type: String,
    optional: true,
  },
  comments: {
    type: [Object],
    optional: true,
  },
  'comments.$.comment': {
    type: String,
  },
  adjustmentValuePositive: {
    type: Number,
    optional: true,
    min: 0,
    defaultValue: 0,
  },
  adjustmentValueNegative: {
    type: Number,
    optional: true,
    max: 0,
    defaultValue: 0,
  },
  maxMarks: {
    type: Number,
    optional: true,
    min: 0,
  },
});

// Mark report schema.
Schemas.Mark = new SimpleSchema({
  _id: {
    type: String,
  },
  marker: {
    type: String,
    optional: false,
  },
  schemeOwner: {
    type: String,
    optional: false,
  },
  studentNo: {
    type: String,
    optional: false,
  },
  schemeId: {
    type: String,
    optional: false,
  },
  schemeName: {
    type: String,
    optional: true,
  },
  createdAt: {
    type: Date,
    autoValue() {
      return new Date();
    },
  },
  aspects: {
    type: [Object],
    optional: true,
  },
  'aspects.$.maxMark': {
    type: Number,
    optional: false,
  },
  'aspects.$.aspect': {
    type: String,
    optional: false,
  },
  'aspects.$.selected': {
    type: String,
    optional: true,
  },
  'aspects.$.mark': {
    type: Number,
    optional: false,
  },
  marks: {
    type: Number,
    min: 0,
    optional: true,
  },
  maxMarks: {
    type: Number,
    min: 0,
  },
  presetComments: {
    type: [String],
    optional: true,
  },
  freeComment: {
    type: String,
    optional: true,
  },
  adjustment: {
    type: Number,
    optional: true,
  },
});

// Activity element schema.
Schemas.Activity = new SimpleSchema({
  actor: {
    type: String,
    optional: false,
  },
  type: {
    type: String,
    optional: false,
  },
  action: {
    type: String,
    optional: false,
  },
  relevantTo: {
    type: String,
    optional: false,
  },
  performedAt: {
    type: Date,
    optional: false,
    autoValue() {
      return new Date();
    },
  },
});

// Unit schema.
Schemas.Units = new SimpleSchema({
  creator: {
    type: String,
    optional: false,
    autoValue() {
      return this.userId;
    },
  },
  units: {
    type: [String],
  },
});

// Attach schemes to database collections.
MarkingSchemes.attachSchema(Schemas.Scheme);
Marks.attachSchema(Schemas.Mark);
Activities.attachSchema(Schemas.Activity);
Units.attachSchema(Schemas.Units);


// Deny all database operations by default.
// Meteor methods should be the only way to access or modify data.

MarkingSchemes.deny({
  insert() {return true;},
  update() {return true;},
  remove() {return true;},
});

Marks.deny({
  insert() {return true;},
  update() {return true;},
  remove() {return true;},
});

Activities.deny({
  insert() {return true;},
  update() {return true;},
  remove() {return true;},
});

Units.deny({
  insert() {return true;},
  update() {return true;},
  remove() {return true;},
});

Meteor.users.deny({
  update() {return true;},
});
