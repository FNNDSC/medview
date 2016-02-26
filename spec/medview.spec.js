/**
 * This module implements the medview's specification (tests).
 *
 */

define(['medview'], function(medview) {

  describe('medview', function() {

    window.jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

    // append a container for the whole viewer
    var container = $('<div id="viewercontainer"></div>');
    $(document.body).append(container);

    var app;

    beforeEach(function() {

      app = new medview.App();
      app.init();
    });

    afterEach(function() {

      app.destroy();
    });

    it('medview.init starts a viewer with a renderers box',

      function() {

        expect(app.view.rBox).not.toBeNull();
      }
    );

    it('medview.init starts a viewer with a toolbar',

      function() {

        expect(app.view.toolbar).not.toBeNull();
      }
    );

  });
});
