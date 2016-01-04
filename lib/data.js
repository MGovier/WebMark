MarkingSchemes = new Mongo.Collection("markingSchemes");

Schemas = {};

Schemas.Scheme = new SimpleSchema({
  name: {
    type: String,
    optional: false
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
    min: 0,
    defaultValue: 0
  },
  maxMarks: {
    type: Number,
    optional: true,
    min: 0
  }
});

MarkingSchemes.attachSchema(Schemas.Scheme);
