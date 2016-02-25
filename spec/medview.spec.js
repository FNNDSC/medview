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

    it('medview.appendAll appends a new volume file obj',

      function() {

        app.appendAll(
          'http://www.googledrive.com/host/0B8u7h0aKnydhd0xHX2h0NENsbEE/w0to1.nii'
        );

        expect(app.imgFileArr[0]).toEqual({
            url: 'http://www.googledrive.com/host/0B8u7h0aKnydhd0xHX2h0NENsbEE/w0to1.nii.gz'
          });
      }
    );

  });
});
