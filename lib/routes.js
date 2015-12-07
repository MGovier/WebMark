Router.configure({
  layoutTemplate: 'main'
});

Router.route('/', {
  template: 'insertScheme',
  name: 'insertScheme'
});

Router.route('/viewSchemes', {
  template: 'viewSchemes',
  name: 'viewSchemes'
});

Router.route('/mark/:_id', {
  name: 'markScheme',
  template: 'markScheme',
  data: function () {
    return MarkingSchemes.findOne({_id: this.params._id});
  }
});