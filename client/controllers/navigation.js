Template.navigation.helpers({
  activeIfTemplate: function(template) {
    var currentRoute = Router.current();
    return currentRoute && template ===
      currentRoute.lookupTemplate() ? 'active' : '';
  }
});
