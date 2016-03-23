Template.notFound.onRendered(() => {
  Meteor.setTimeout(() => {
    $('.not-found').show();
  }, 200);
});
