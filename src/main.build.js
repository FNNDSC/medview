require.config({
  baseUrl: '.',
  paths: {
    jquery: ['https://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min',
      'libs/jquery/dist/jquery.min'],
    jquery_ui: ['https://ajax.googleapis.com/ajax/libs/jqueryui/1.11.2/jquery-ui.min',
      'libs/jquery-ui/jquery-ui.min'],
    medview: 'js/medview.min'
  }
});

require(['medview'], function(medview) {

  // Entry point
  var app = new medview.App();
  app.init();
});
