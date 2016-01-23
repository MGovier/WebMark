Template.marks.created = function() {
  this.filter = new ReactiveTable.Filter('filter-table');
  console.log('filter', this.filter.get());
};

Template.marks.helpers({
  settings: function () {
    return {
      collection: Template.instance().data.marks,
      rowsPerPage: 40,
      filters: ['filter-table'],
      class: 'ui table striped selectable',
      fields: [
        {key: 'studentNo', label: 'Student No.'},
        {key: 'marker', label: 'Marked By'},
        {key: 'createdAt', label: 'Marked At', fn: function (value) { return moment(value).format('llll');}},
        {key: 'marks', label: 'Mark'},
        {key: 'percentage', label: 'Percentage', fn: function (value, object) { return Math.round((object.marks / object.maxMarks) * 100);}}
      ]
    };
  }
});

Template.marks.events({
  'click .reactive-table tbody tr': function (evt, template) {
    Router.go('markReport', {_id:this._id, _sid: template.data.markingScheme._id});
  },
  'keyup #filter-table': function (evt, template) {
    template.filter.set($(evt.currentTarget).val());
  }
});

Template.marks.helpers({
  filterVar: function () {
    return Template.instance().filter.get();
  }
})

Template.markingReport.helpers({
  percentage: function (mark, total) {
    return Math.round((mark/total) * 100);
  },
  showAdj: function (value) {
    if (value > 0) {
      return '+' + value;
    } else {
      return value;
    }
  }
});
