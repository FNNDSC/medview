/**
 * Medview app
 *
 * This app reads a directory tree from a directory picker/dropzone button (chrome)
 * or multiple neuroimage files in the same directory (other browsers) into an array
 * of objects and pass it to a viewerjs.Viewer object for visualization and collaboration.
 * The app can contain several viewerjs.Viewer objects which will be displayed in different tabs.
 * A new viewer tab can also be started by joining an existing realtime collaboration among
 * remote viewerjs.Viewer instances.
 */

// define a new module
define(
  [
  // bower components
  '../../../gcjs/src/js/gcjs',
  '../../../viewerjs/src/js/viewerjs'

  ], function(cjs, viewerjs) {

    // Provide a namespace
    var medview = medview || {};

    medview.App = function() {

      // Client ID from the Google's developer console
      this.CLIENT_ID = '1050768372633-ap5v43nedv10gagid9l70a2vae8p9nah.apps.googleusercontent.com';

      this.collaborator = new cjs.GDriveCollab(this.CLIENT_ID);

      // Create a new viewerjs.Viewer object
      // A collaborator object is only required if we want to enable realtime collaboration.
      this.view = new viewerjs.Viewer('viewercontainer', this.collaborator);

      this.imgFileArr = [];

      // jQuery object for the library dialog window
      this.libraryWin = null;
    };

    medview.App.prototype.appendAll = function(baseUrl) {

      this.imgFileArr.push({
        'url': baseUrl + '.gz'
      });

      this.imgFileArr.push({
        'url': baseUrl + '.jpg'
      });

      this.imgFileArr.push({
        'url': baseUrl + '.json'
      });
    };

    medview.App.prototype.init = function() {

      this.view.init();
      this.initLibraryWindow();
      this.addToolbarButtons();

      //
      // 0-1 weeks
      this.appendAll(
        'http://www.googledrive.com/host/0B8u7h0aKnydhd0xHX2h0NENsbEE/w0to1.nii'
      );

      //
      // quarter 0
      this.appendAll(
        'http://www.googledrive.com/host/0B8u7h0aKnydhU0hjTnRIaFZPWWM/q0.nii'
      );

      //
      // quarter 1
      this.appendAll(
        'http://www.googledrive.com/host/0B8u7h0aKnydhWS1heHNxYmp1eTA/q1.nii'
      );

      //
      // quarter 2
      this.appendAll(
        'http://www.googledrive.com/host/0B8u7h0aKnydhQnlxVC04ZUo4R1U/q2.nii'
      );

      // quarter 3
      this.appendAll(
        'http://www.googledrive.com/host/0B8u7h0aKnydhU0RpaTNCaXhDZWc/q3.nii'
      );

      //
      // year 1 to 2
      this.appendAll(
        'http://www.googledrive.com/host/0B8u7h0aKnydheWpyem90LVloR1U/y1to2.nii'
      );

      //
      // year 2 to 3
      this.appendAll(
        'http://www.googledrive.com/host/0B8u7h0aKnydhalFfU0FFejlwWTA/y2to3.nii'
      );

      //
      // year 3 to 4
      this.appendAll(
        'http://www.googledrive.com/host/0B8u7h0aKnydhNDM1dTFYaUo3NjQ/y3to4.nii'
      );

      //
      // year 4 to 5
      this.appendAll(
        'http://www.googledrive.com/host/0B8u7h0aKnydhMmtBRThMUnV4Q2s/y4to5.nii'
      );

      //
      // year 5 to 6
      this.appendAll(
        'http://www.googledrive.com/host/0B8u7h0aKnydhZ2NPelRlLWlVRk0/y5to6.nii'
      );

      // load atlases
      this.view.addData(this.imgFileArr);
    };

    medview.App.prototype.addToolbarButtons = function() {
      var self = this;

      var showButton = function(btnId) {

        var btn = self.view.toolBar.getButton(btnId);

        if (btn.label) {

          btn.label.css({display: ''});
        }

        self.view.toolBar.showButton(btnId);
      };

      // show non-functional hidden buttons in the toolbar
      showButton('fiducial');
      showButton('distance');
      showButton('angle');
      showButton('note');
      showButton('pointer');
      showButton('search');
      showButton('adjust');
      showButton('arrows');
      showButton('gear');

      //
      // Load library files
      self.view.toolBar.addButton({
        id: 'book',
        title: 'Load from library',
        caption: '<i class="fa fa-book"></i>',
        onclick: function() {

          self.libraryWin.dialog('open');

        }
      });

      // move the book button next to the load button
      var loadBtn = self.view.toolBar.getButton('load').button;
      var libraryBtn = self.view.toolBar.getButton('book').button;
      loadBtn.after(libraryBtn);
    };

    /**
     * Initilize library window's HTML and event handlers.
     */
    medview.App.prototype.initLibraryWindow = function() {
      var self = this;

      self.libraryWin = $('<div></div>');

      // convert the previous div into a floating window with a close button
      self.libraryWin.dialog({
        title: 'Load additional data',
        modal: true,
        autoOpen: false,
        minHeight: 400,
        height: 600,
        minWidth: 700,
        width: 800
      });

      var library = [
      {
        sectionLabel: 'Day 0 to 14',
        notes: 'Oh yes I\'m a cool notes',
        datasets: [
          'http://www.googledrive.com/host/0B8u7h0aKnydhd0xHX2h0NENsbEE/w0to1.nii',
          'http://www.googledrive.com/host/0B8u7h0aKnydhd0xHX2h0NENsbEE/w0to1.nii',
          'http://www.googledrive.com/host/0B8u7h0aKnydhd0xHX2h0NENsbEE/w0to1.nii',
          'http://www.googledrive.com/host/0B8u7h0aKnydhd0xHX2h0NENsbEE/w0to1.nii'
        ]
      },
      {
        sectionLabel: 'Quarter 0',
        notes: 'Me too!',
        datasets: [
          'http://www.googledrive.com/host/0B8u7h0aKnydhd0xHX2h0NENsbEE/w0to1.nii',
          'http://www.googledrive.com/host/0B8u7h0aKnydhd0xHX2h0NENsbEE/w0to1.nii',
          'http://www.googledrive.com/host/0B8u7h0aKnydhd0xHX2h0NENsbEE/w0to1.nii',
          'http://www.googledrive.com/host/0B8u7h0aKnydhd0xHX2h0NENsbEE/w0to1.nii'
        ]
      },
      {
        sectionLabel: 'Quarter 1',
        notes: 'Oh yes I\'m a cool notes too',
        datasets: [
          'http://www.googledrive.com/host/0B8u7h0aKnydhd0xHX2h0NENsbEE/w0to1.nii',
          'http://www.googledrive.com/host/0B8u7h0aKnydhd0xHX2h0NENsbEE/w0to1.nii',
          'http://www.googledrive.com/host/0B8u7h0aKnydhd0xHX2h0NENsbEE/w0to1.nii',
          'http://www.googledrive.com/host/0B8u7h0aKnydhd0xHX2h0NENsbEE/w0to1.nii'
        ]
      }];

      var libraryContainerDiv = document.createElement('div');
      $(libraryContainerDiv)
          .addClass('library');
      self.libraryWin.append($(libraryContainerDiv));

      for (var i = 0; i < library.length; i++) {
        // section
        var sectionDiv = document.createElement('div');
        $(sectionDiv)
          .addClass('section')
          .attr('sectionIndex', i);
        $(libraryContainerDiv).append($(sectionDiv));

        // title
        var titleDiv = document.createElement('div');
        $(titleDiv)
          .addClass('title')
          .html(library[i].sectionLabel);
        $(sectionDiv).append($(titleDiv));

        // note
        var notesDiv = document.createElement('div');
        $(notesDiv)
          .addClass('notes')
          .html(library[i].notes);
        $(sectionDiv).append($(notesDiv));

        // thumbnails
        var thumbnailsContainerDiv = document.createElement('div');
        $(thumbnailsContainerDiv)
          .addClass('thumbnailsContainer');
        $(sectionDiv).append($(thumbnailsContainerDiv));

        for (var j = 0; j < library[i].datasets.length; j++) {
          var thumbnailDiv = document.createElement('div');
          $(thumbnailDiv)
            .addClass('thumbnail')
            .css('background-image', 'url(' + library[i].datasets[j] + '.jpg)');
          $(thumbnailsContainerDiv).append(thumbnailDiv);
        }
      }

      // fill content (no need for append)

      // connect search bar...
      // $('.view-librarywin-input').keyup(function() {
      //   var valThis = $(this).val();
      //   window.console.log('connecter: ' + valThis);
      //   $('.navList>li').each(function() {
      //     var text = $(this).text().toLowerCase();
      //     return (text.indexOf(valThis) === 0) ? $(this).show() : $(this).hide();
      //   });
      // });

      // connect each element of the lists to nii, json and jpg
      $('.library > .section').on('click', function() {

        var sectionIndex = $(this).attr('sectionIndex');
        window.console.log(sectionIndex);

        // build list
        var imgFileArr = [];

        for (var i = 0; i < library[sectionIndex].datasets.length; i++) {
          imgFileArr.push({
            'url': library[sectionIndex].datasets[i] + '.gz'
          });

          imgFileArr.push({
            'url': library[sectionIndex].datasets[i] + '.jpg'
          });

          imgFileArr.push({
            'url': library[sectionIndex].datasets[i] + '.json'
          });
        }

        // load atlases
        self.view.addData(imgFileArr);

        // close window
        self.libraryWin.dialog('close');
      });
    };

    medview.App.prototype.destroy = function() {

      this.view.destroy();
      this.imgFileArr = [];

      if (this.libraryWin) { this.libraryWin.dialog('destroy'); }
      this.libraryWin = null;
    };

    return medview;
  });
