MarkingSchemes = new Mongo.Collection('markingSchemes');

Marks = new Mongo.Collection('marks');

Activities = new Mongo.Collection('activities');

Ground.Collection(MarkingSchemes);
Ground.Collection(Marks);
Ground.Collection(Activities);

Schemas = {};

Schemas.Scheme = new SimpleSchema({
  name: {
    type: String,
    optional: false
  },
  creator: {
    type: String,
    optional: false,
    autoValue: function () {
      return this.userId;
    },
    denyUpdate: true
  },
  description: {
    type: String,
    optional: true
  },
  createdAt: {
    type: Date
  },
  aspects: {
    type: [Object]
  },
  'aspects.$.aspect': {
    type: String,
    optional: false
  },
  'aspects.$.maxMark': {
    type: Number,
    optional: false,
    min: 0
  },
  'aspects.$.rows': {
    type: [Object],
    minCount: 1
  },
  'aspects.$.rows.$.criteriaValue': {
    type: Number,
    defaultValue: 0
  },
  'aspects.$.rows.$.criteria': {
    type: String,
    optional: true
  },
  comments: {
    type: [Object],
    optional: true
  },
  'comments.$.comment': {
    type: String,
  },
  adjustmentValuePositive: {
    type: Number,
    optional: true,
    min: 0,
    defaultValue: 0
  },
  adjustmentValueNegative: {
    type: Number,
    optional: true,
    max: 0,
    defaultValue: 0
  },
  maxMarks: {
    type: Number,
    optional: true,
    min: 0
  }
});

Schemas.Mark = new SimpleSchema({
  marker: {
    type: String,
    optional: false
  },
  schemeOwner: {
    type: String,
    optional: false
  },
  studentNo: {
    type: String,
    optional: false
  },
  schemeId: {
    type: String,
    optional: false
  },
  schemeName: {
    type: String,
    optional: true
  },
  createdAt: {
    type: Date,
    autoValue: function () {
      return new Date();
    }
  },
  aspects: {
    type: [Object],
    optional: true
  },
  'aspects.$.maxMark': {
    type: Number,
    optional: false
  },
  'aspects.$.aspect': {
    type: String,
    optional: false
  },
  'aspects.$.selected': {
    type: String,
    optional: true
  },
  'aspects.$.mark': {
    type: Number,
    optional: false
  },
  marks: {
    type: Number,
    min: 0,
    optional: true
  },
  maxMarks: {
    type: Number,
    min: 0
  },
  presetComments: {
    type: [String],
    optional: true
  },
  freeComment: {
    type: String,
    optional: true
  },
  adjustment: {
    type: Number,
    optional: true
  }
});

Schemas.Activity = new SimpleSchema({
  actor: {
    type: String,
    optional: false
  },
  type: {
    type: String,
    optional: false
  },
  action: {
    type: String,
    optional: false
  },
  relevantTo: {
    type: String,
    optional: false
  },
  performedAt: {
    type: Date,
    optional: false,
    autoValue: function () {
      return new Date();
    }
  }
});

MarkingSchemes.attachSchema(Schemas.Scheme);
Marks.attachSchema(Schemas.Mark);
Activities.attachSchema(Schemas.Activity);
