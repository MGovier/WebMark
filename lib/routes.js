Router.configure({
    layoutTemplate: 'main'
});

Router.route('/', {
    template: 'insertScheme',
    name: 'insertScheme'
});

Router.route('/mark', {
    template: 'markScheme'
});