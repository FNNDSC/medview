/**
 *
 * Viewer app
 *
 */

/**
 * (re) Define namespace if needed
 */
var app = app || {};

  app.App = function() {

    // Multidimensional associative array with ordered DICOM file names
    this._dcmData = {};
    // Number of DICOM files
    this._numDicoms = 0;
    // Number of files that are not DICOMs
    this._numNotDicoms = 0;
    // Data structure from which the source object for a Viewer is built
    this._indexedData = {};
    this._indexedData['fibers'] = [];
    this._indexedData['mesh'] = [];
    this._indexedData['volume'] = [];
    // Total number of files
    this._numFiles = 0;
    // Viewer object
    this.view = null;

    // Event handler for the directory loader button
    var dirBtn = document.getElementById('dirbtn');
    var self = this;
    dirBtn.onchange = function(e) {
      var dir = e.target.files;

      self._numFiles = dir.length;
      for (var i=0; i<self._numFiles; i++) {
        self.add(dir[i]);
      }
    }

  }


  /**
   * Add file into internal data structures
   */
    app.App.prototype.add = function(fileObj) {
      var path;
      if (fileObj.webkitRelativePath) {
        path = fileObj.webkitRelativePath;
      } else {
        path = fileObj.mozFullPath;
      }
      var url = path.substring(0, path.lastIndexOf('/') + 1);
      var filename = fileObj.name;

      if (viewer.Viewer.isDicom(filename)) {
        this.parseDicom(fileObj);
      } else {
        // push fibers, meshes and volumes into this._indexedData
        if (viewer.Viewer.isFibers(filename)) {
          this._indexedData['fibers'].push({'url': url, 'fileObj': [fileObj]});
        } else if (viewer.Viewer.isGeomModel(filename)) {
            this._indexedData['mesh'].push({'url': url, 'fileObj': [fileObj]});
        } else if (viewer.Viewer.isVolume(filename)) {
            this._indexedData['volume'].push({'url': url, 'fileObj': [fileObj]});
        }
        ++this._numNotDicoms;
        // if all files have been added then create view
        if (this._numDicoms + this._numNotDicoms == this._numFiles) {
          this.createView();
        }
      }
    }

  /**
   * Parse and organize DICOM files by patientID, studyInstanceUID,
   * seriesInstanceUID, sopInstanceUID
   */
    app.App.prototype.parseDicom = function(fileObj) {
      var reader = new FileReader();
      var self = this;

      reader.onload = function(ev) {
        var arrayBuffer = reader.result;
        // Here we have the file data as an ArrayBuffer.  dicomParser requires as input a
        // Uint8Array so we create that here
        var byteArray = new Uint8Array(arrayBuffer);
        // Invoke the parseDicom function and get back a DataSet object with the contents
        var dataSet, patientID, studyInstanceUID, seriesInstanceUID, sopInstanceUID;
        var path;
        if (fileObj.webkitRelativePath) {
          path = fileObj.webkitRelativePath;
        } else {
          path = fileObj.mozFullPath;
        }
        var url = path.substring(0, path.lastIndexOf('/') + 1);
        var filename = fileObj.name;

        try {
          dataSet = dicomParser.parseDicom(byteArray);
          // Access any desire property using its tag
          patientID = dataSet.string('x00100020');
          studyInstanceUID = dataSet.string('x0020000d');
          seriesInstanceUID = dataSet.string('x0020000e');
          sopInstanceUID = dataSet.string('x00080018');
          if (!self._dcmData[patientID]) {
            self._dcmData[patientID] = {};
          }
          if (!self._dcmData[patientID][studyInstanceUID]) {
            self._dcmData[patientID][studyInstanceUID] = {};
          }
          if (!self._dcmData[patientID][studyInstanceUID][seriesInstanceUID]) {
            self._dcmData[patientID][studyInstanceUID][seriesInstanceUID] = {};
            self._dcmData[patientID][studyInstanceUID][seriesInstanceUID]['url'] = url;
            self._dcmData[patientID][studyInstanceUID][seriesInstanceUID]['fileObj'] = [];
          }
          if (!self._dcmData[patientID][studyInstanceUID][seriesInstanceUID][sopInstanceUID]) {
            self._dcmData[patientID][studyInstanceUID][seriesInstanceUID]['fileObj'].push(fileObj);
            self._dcmData[patientID][studyInstanceUID][seriesInstanceUID][sopInstanceUID] = filename;
          }
          ++self._numDicoms;
          // if all files have been added then create view
          if (self._numDicoms + self._numNotDicoms == self._numFiles) {
            self.createView();
          }
        } catch(err) {
          alert('File ' + path + ' Error - ' + err);
        }
      };
      reader.readAsArrayBuffer(fileObj);
    }

  /**
   * Create Viewer object
   */
    app.App.prototype.createView = function() {
      // Push ordered DICOMs into this._indexedData
      for (var patient in this._dcmData) {
        for (var study in this._dcmData[patient]) {
          for (var series in this._dcmData[patient][study]) {
            this._indexedData['volume'].push({'url': this._dcmData[patient][study][series]['url'],
            'fileObj': this._dcmData[patient][study][series]['fileObj']});
          }
        }
      }
      // Build source object
      window.console.log(this._indexedData);
      var source = this.buildSource();
      // Instantiate a new Viewer object
      if (this.view) {
        this.view.destroy();
        this.view = null;
      }
      this.view = new viewer.Viewer(source, 'viewercontainer');
      //app.view.connect(feedID);
    }


    /**
     * Helper functions to build a source object for a Viewer (same as fancytree's source):
     * https://github.com/mar10/fancytree/wiki
     */

    app.App.prototype.buildSource = function(){
        var tree = [];
        var dataObj = this._indexedData;

        // Loop through models, fibers and volumes
        for (var type in dataObj) {
           var typeArr = dataObj[type];

           // loop though all obj of a same type
           for (var i=0; i < typeArr.length; i++){
            this._addToTree(tree, typeArr[i], type);
           }
        }
        return tree;
    }

    app.App.prototype._addToTree = function(tree, obj, type){
        return this._parseTree(tree, obj, 0, type, [], '');
    }

    app.App.prototype._parseTree = function(subtree, obj, depth, type, files, key){
        // get current location
        var path = obj.url.split('/');
        var indexSubTree;

        // if we reach the file
        if (depth >= path.length) {
            indexSubTree = subtree.length;
            subtree.push(this._createTreeFile(obj.fileObj[0].name, type, obj.url, obj.fileObj, key + indexSubTree.toString()));
            return;
        }
        // subtree is not there, create it
        indexSubTree = -1;
        // loop through tree and look for 'title' match
        for (var i=0; i<subtree.length; i++){
          if (subtree[i].title == path[depth]) {
            indexSubTree = i;
            break;
          }
        }
        // we push object to children
        if(indexSubTree == -1){
            indexSubTree = subtree.length;
            key = key.toString() + subtree.length.toString();
            subtree.push(this._createTreeFolder(path[depth], key));
        } else {
            key = subtree[indexSubTree].key;
        }
        this._parseTree(subtree[indexSubTree].children, obj, depth + 1, type, files, key);
    }

    app.App.prototype._createTreeFolder = function(title, key){
        return { 'title': title,
                 'key': key,
                 'folder' : true,
                 'hideCheckbox' : true,
                 'children': []
                };
    }

    app.App.prototype._createTreeFile = function(title, type, url, files, key){
        var filenames = [];

        // the viewer always expect a list of filename strings
        // we have added a list of HTML5 File objects
        for (var i=0; i<files.length; i++) {
          filenames[i] = files[i].name;
        }
        return { 'title': title,
                 'key': key,
                 'type' : type,
                 'url'  : url,
                 'files' : filenames,
                 'fileObjs': files,
                 'extraClasses' : type + 'Icon'
                };
    }


/**
 * Entry point
 */
app.appObj = new app.App();
