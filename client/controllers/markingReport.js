Template.markingReport.helpers({
  percentage: function(mark, total) {
    return Math.round((mark / total) * 100);
  },
  showAdj: function(value) {
    if (value > 0) {
      return '+' + value;
    } else {
      return value;
    }
  }
});
