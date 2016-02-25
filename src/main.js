require(['./config'], function() {

  require(['medview'], function(medview) {

    // Entry point
    var app = new medview.App();
    app.init();
  });
});
