/**
 * Marking Report controller.
 */

/**
 * Called when built.
 * Autorun tied to data source,
 * to keep marking report up to date if it or the scheme changes.
 */
Template.markingReport.onCreated(function created() {
  const self = this;
  self.autorun(() => {
    self.subscribe('markingSchemes', FlowRouter.getParam('_sid'));
    self.subscribe('marks', FlowRouter.getParam('_id'));
  });
});

/**
 * Helper functions used in template.
 */
Template.markingReport.helpers({
  report() {
    return Marks.findOne({ _id: FlowRouter.getParam('_id') });
  },
  scheme() {
    return MarkingSchemes.findOne({ _id: FlowRouter.getParam('_sid') });
  },
  percentage(mark, total) {
    return Math.round((mark / total) * 100);
  },
  // Tell the user if an adjustment was applied.
  showAdj(value) {
    if (value > 0) {
      return `+ ${value}`;
    }
    return value;
  },
});
