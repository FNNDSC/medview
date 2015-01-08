/**
 * This file manager module takes care of all file reading and saving operations
 * on diverse filesystems, including cloud uploading/downloading operations as
 * well as reading/writing the HTML5 sandboxed file system.
 *
 * FEATURES
 * - Read/write files from/to HTML5 sandbox file system
 * - Upload/Download files from the cloud
 *
 * TECHNOLOGY
 * - HTML5 filesystem API
 * - Google drive API
 */


//Provide a namespace for the file manager module
var fm = fm || {};

  /**
   * Generic abstract method
   */
  fm.abstractmethod = function() {
    throw new Error('abstract method');
  }

  /**
   * Abstract class defining a file manager's interface
   */
  fm.AbstractFileManager = function() {
    throw new Error('Can not instantiate abstract classes');
  }

  fm.AbstractFileManager.prototype.isFile = fm.abstractmethod;

  fm.AbstractFileManager.prototype.readFile = fm.abstractmethod;

  fm.AbstractFileManager.prototype.writeFile = fm.abstractmethod;


  /**
   * Concrete class implementing a file manager for the local FS.
   * Currently uses the HTML5's sandboxed FS API (only implemented on Chrome)
   */
  fm.LocalFileManager = function() {

    // local filesystem object
    this.fs = null;

  }

  /**
   * fm.LocalFileManager class inherits from fm.AbstractFileManager class
   */
  fm.LocalFileManager.prototype = Object.create(fm.AbstractFileManager.prototype);
  fm.LocalFileManager.prototype.constructor = fm.LocalFileManager;

  /**
   * Request sandboxed filesystem
   */
  fm.LocalFileManager.prototype.requestFileSystem = function() {
    var self = this;

    // The file system has been prefixed as of Google Chrome 12:
    window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
    // Request 5GB
    /*window.webkitStorageInfo.requestQuota( PERSISTENT, 5*1024*1024*1024, function(grantedBytes) {
      window.requestFileSystem(PERSISTENT, grantedBytes, function(fs){self.fs = fs;}, self.fsErrorHandler);
    }, function(e) {
      console.log('Error', e);} ); */
    if (window.requestFileSystem) {
      window.requestFileSystem(window.TEMPORARY, 5*1024*1024*1024, function(fs){
        self.fs = fs;
      }, self.fsErrorHandler);
    }
  }

  /**
   * Determine whether a file exists in the sandboxed FS
   *
   * @param {String} file's path.
   * @param {Function} callback whose argument is the File object if found or
   * null otherwise.
   */
  fm.LocalFileManager.prototype.isFile = function(fPath, callback) {

    function errorHandler(e) {
      console.log('File not found. Error code: ' + e.code);
      callback(null);
    }

    if (this.fs) {
      this.fs.root.getFile(fPath, {create: false}, function(fileEntry) {
        // Get a File object representing the file,
        fileEntry.file(function(fileObj) {
          callback(fileObj);
        }, errorHandler);
      }, errorHandler);
    } else {
      throw new Error('No filesystem previously granted');
    }
  }

  /**
   * Read a file from the sandboxed FS
   *
   * @param {String} file's path.
   * @param {Function} callback whose argument is an ArrayBuffer object containing
   * the file data if the file is successfuly read or null otherwise.
   */
  fm.LocalFileManager.prototype.readFile = function(fPath, callback) {

    function errorHandler(e) {
      console.log('Could not read file. Error code: ' + e.code);
      callback(null);
    }

    if (this.fs) {
      this.fs.root.getFile(fPath, {create: false}, function(fileEntry) {
        // Get a File object representing the file,
        fileEntry.file(function(fileObj) {
          var reader = new FileReader();

          reader.onload = function(ev) {
            callback(this.result);
          }

          reader.readAsArrayBuffer(fileObj);
        }, errorHandler);
      }, errorHandler);
    } else {
      throw new Error('No filesystem previously granted');
    }
  }

  /**
   * Write a file to the sandboxed FS
   *
   * @param {String} file's path.
   * @param {Array} ArrayBuffer object containing the file data.
   * @param {Function} optional callback whose argument is the File object or
   * null otherwise.
   */
  fm.LocalFileManager.prototype.writeFile = function(fPath, data, callback) {

      function errorHandler(e) {
        console.log('Could not write file. Error code: ' + e.code);
        if (callback) {
          callback(null);
        }
      }

      if (this.fs) {
        this.fs.root.getFile(fPath, {create: true}, function(fileEntry) {
          // Create a FileWriter object for our FileEntry (fPath).
          fileEntry.createWriter(function(fileWriter) {

            fileWriter.onwrite = function(e) {
              if (callback) {
                // Get a File object representing the file,
                fileEntry.file(function(fileObj) {
                  callback(fileObj);
                }, errorHandler);
              }
            }

            fileWriter.onerror = function(e) {
              console.log('Could not write file. Error code: ' + e.toString());
              if (callback) {
                callback(null);
              }
            }

            var bBuilder = new BlobBuilder();
            bBuilder.append(data);
            var dataBlob = bBuilder.getBlob();
            fileWriter.write(blob);

          }, errorHandler);
        }, errorHandler);
      } else {
        throw new Error('No filesystem previously granted');
      }
  }


  /**
   * Concrete class implementing a file manager for Google Drive.
   * Uses Google Drive's API
   */
  fm.GDriveFileManager = function() {


  }

  /**
   * fm.GDriveFileManager class inherits from fm.AbstractFileManager class
   */
  fm.GDriveFileManager.prototype = Object.create(fm.AbstractFileManager.prototype);
  fm.GDriveFileManager.prototype.constructor = fm.GDriveFileManager;

  /**
   * Determine whether a file exists in the GDrive cloud
   *
   * @param {String} file's url.
   */
  fm.GDriveFileManager.prototype.isFile = function(url) {

  }

  /**
   * Read a file from GDrive cloud
   *
   * @param {String} file's url.
   */
  fm.GDriveFileManager.prototype.readFile = function(url) {}

  /**
   * Write a file to GDrive cloud
   *
   * @param {String} file's url.
   */
  fm.LocalFileManager.prototype.writeFile = function(url) {}


  /**
   * Concrete class implementing a file manager for Dropbox.
   * Uses Dropbox API
   */
  fm.DropboxFileManager = function() {


  }

  /**
   * fm.DropboxFileManager class inherits from fm.AbstractFileManager class
   */
  fm.DropboxFileManager.prototype = Object.create(fm.AbstractFileManager.prototype);
  fm.DropboxFileManager.prototype.constructor = fm.DropboxFileManager;

  /**
   * Determine whether a file exists in the Dropbox cloud
   *
   * @param {String} file's url.
   */
  fm.DropboxFileManager.prototype.isFile = function(url) {

  }

  /**
   * Read a file from Dropbox cloud
   *
   * @param {String} file's url.
   */
  fm.DropboxFileManager.prototype.readFile = function(url) {}

  /**
   * Write a file to Dropbox cloud
   *
   * @param {String} file's url.
   */
  fm.DropboxFileManager.prototype.writeFile = function(url) {}
