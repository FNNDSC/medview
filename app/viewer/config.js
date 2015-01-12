require.config({
    baseUrl: 'viewer',
    paths: {
        // the left side is the module ID,
        // the right side is the path to
        // the jQuery file, relative to baseUrl.
        // Also, the path should NOT include
        // the '.js' file extension. This example
        // is using jQuery located at
        // lib/jquery.min.js, relative to
        // the baseUrl.
        jquery: 'lib/jquery.min',
        jquery_ui: 'lib/jquery-ui-1.8.23.custom.min',
        dicomParser: 'lib/dicomParser.min',
        collab: 'js/collab',
        fancytree: 'lib/fancytree/jquery.fancytree.min',
        xtk: 'lib/xtk_edge',
        xdat: 'lib/xtk_xdat.gui',
        jquery: 'lib/jquery.min',
        fm: 'js/fm',
        viewer: 'js/viewer',
    }
});

// 1st level dependencies
require(['jquery', 'jquery_ui', 'fm'], function() {
  // 2nd level dependencies
  require(['collab', 'fancytree', 'xtk', 'xdat', 'dicomParser'], function() {
    // 3rd level dependencies
    require(['https://togetherjs.com/togetherjs-min.js', 'https://apis.google.com/js/client.js', 'viewer'], function() {
      require([

        // Put the path to your script (the one who instantiates a viewer object)
        // relative to the viewer folder here
        '../app.js'

        ]);
    });
  });
});
