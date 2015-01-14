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

  fm.AbstractFileManager.prototype.createPath = fm.abstractmethod;


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
      }, function(e) {throw new Error('Could not grant filesystem. Error code: ' + e.code)});
    }
  }

  /**
   * Create a new directory path in the sandboxed FS
   *
   * @param {String} new absolute path to be created.
   * @param {Function} optional callback whose argument is the directory entry or
   * null otherwise.
   */
  fm.LocalFileManager.prototype.createPath = function(path, callback) {

    function errorHandler(e) {
      console.log('Could not create path. Error code: ' + e.code);
      if (callback) {
        callback(null);
      }
    }

    if (this.fs) {

      function createDir(rootDirEntry, folders) {
        // exclusive:false means if the folder already exists then don't throw an error
        rootDirEntry.getDirectory(folders[0], {create: true, exclusive:false}, function(dirEntry) {
          // Recursively add the new subfolder (if we still have another to create).
          folders = folders.slice(1);
          if (folders.length) {
            createDir(dirEntry, folders);
          } else if (callback) {
            callback(dirEntry);
          }
        }, errorHandler);

      }

      folders = fm.path2array(path);
      createDir(this.fs, folders); // fs.root is a DirectoryEntry

    } else {
      throw new Error('No filesystem previously granted');
    }
  }

  /**
   * Determine whether a file exists in the sandboxed FS
   *
   * @param {String} file's path.
   * @param {Function} callback whose argument is the File object if found or
   * null otherwise.
   */
  fm.LocalFileManager.prototype.isFile = function(filePath, callback) {

    function errorHandler(e) {
      console.log('File not found. Error code: ' + e.code);
      callback(null);
    }

    if (this.fs) {
      this.fs.root.getFile(filePath, {create: false}, function(fileEntry) {
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
  fm.LocalFileManager.prototype.readFile = function(filePath, callback) {

    function errorHandler(e) {
      console.log('Could not read file. Error code: ' + e.code);
      callback(null);
    }

    if (this.fs) {
      this.fs.root.getFile(filePath, {create: false}, function(fileEntry) {
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
  fm.LocalFileManager.prototype.writeFile = function(filePath, fileData, callback) {

    if (this.fs) {
      var self = this;
      var basedir = filePath.substring(0, filePath.lastIndexOf('/'));

      function errorHandler(e) {
        console.log('Could not write file. Error code: ' + e.code);
        if (callback) {
          callback(null);
        }
      }

      function writeFile() {
        self.fs.root.getFile(filePath, {create: true}, function(fileEntry) {
          // Create a FileWriter object for our FileEntry (filePath).
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
            bBuilder.append(fileData);
            var dataBlob = bBuilder.getBlob();
            fileWriter.write(blob);

          }, errorHandler);
        }, errorHandler);
      }

      this.fs.getDirectory(basedir, {create: false}, function(dirEntry) {
        writeFile();
      }, function (e) {if (e.code === FileError.NOT_FOUND_ERR) {
        self.createPath(basedir, writeFile);} else {
          errorHandler(e);
        }} );

    } else {
      throw new Error('No filesystem previously granted');
    }
  }


  /**
   * Concrete class implementing a file manager for Google Drive.
   * Uses Google Drive's API
   */
  fm.GDriveFileManager = function() {
    this.CLIENT_ID = '358010366372-o8clkqjol0j533tp6jlnpjr2u2cdmks6.apps.googleusercontent.com';
    // Per-file access to files uploaded through the API
    this.SCOPES = 'https://www.googleapis.com/auth/drive.file';
    // Has Google Drive API been loaded?
    this.driveAPILoaded = false;

  }

  /**
   * fm.GDriveFileManager class inherits from fm.AbstractFileManager class
   */
  fm.GDriveFileManager.prototype = Object.create(fm.AbstractFileManager.prototype);
  fm.GDriveFileManager.prototype.constructor = fm.GDriveFileManager;

  /**
   * Request GDrive filesystem (authorization and scope)
   */
  fm.GDriveFileManager.prototype.requestFileSystem = function() {

  }

  /**
   * Check if the current user has authorized the application.
   */
  fm.GDriveFileManager.prototype.checkAuth = function() {
    gapi.auth.authorize(
      {'client_id': this.CLIENT_ID, 'scope': this.SCOPES, 'immediate': true},
      this.handleAuthResult);
  }

  /**
   * Called when authorization server replies.
   *
   * @param {Object} authResult Authorization result.
   */
   fm.GDriveFileManager.prototype.handleAuthResult = function(authResult) {
     var authButton = document.getElementById('authorizeButton');

     authButton.style.display = 'none';
     if (authResult && !authResult.error) {

     } else {
       // No access token could be retrieved, show the button to start the authorization flow.
       authButton.style.display = 'block';
       authButton.onclick = function() {
         gapi.auth.authorize(
           {'client_id': CLIENT_ID, 'scope': SCOPES, 'immediate': false},
           this.handleAuthResult);
       };
     }
   }

  /**
   * Create a new directory path in the GDrive cloud
   *
   * @param {String} new absolute path to be created.
   * @param {Function} optional callback whose argument is the folder creation
   * response object or null otherwise.
   */
  fm.GDriveFileManager.prototype.createPath = function(path, callback) {

    function createDir(rootResp, folders) {
      // list folder with name folders[0] if it already exists
      var findRequest = gapi.client.drive.children.list({
        'folderId': rootResp.id,
        'q': "mimeType='application/vnd.google-apps.folder' and title='" + folders[0] + "'"
        });

      findRequest.execute(function(findResp) {
        // if folder not found then create it
        if (findResp.items.length==0) {
          var request = gapi.client.drive.files.insert({
            'resource': {'title': folders[0], 'mimeType': 'application/vnd.google-apps.folder', 'parents': [{'id': rootResp.id}]}
          });

          request.execute(function(resp) {
            folders = folders.slice(1);
            if (folders.length) {
              //recursively create subsequent folders if needed
              createDir(resp, folders);
            } else if (callback) {
              callback(resp);
            }
          });

        } else {
          folders = folders.slice(1);
          if (folders.length) {
            // recursively create subsequent folders if needed
            createDir(findResp.items[0], folders);
          } else if (callback) {
            callback(findResp.items[0]);
          }
        }
      });

    }

    folders = fm.path2array(path);
    if (folders.length) {
      createDir({'id': 'root'}, folders);
    } else if (callback) {
      callback(null);
    }

  }

  /**
   * Determine whether a file exists in the GDrive cloud
   *
   * @param {String} file's path.
   * @param {Function} callback whose argument is the File object if found or
   * null otherwise.
   */
  fm.GDriveFileManager.prototype.isFile = function(filePath, callback) {
    entries = fm.path2array(filePath);
  }

  /**
   * Read a file from GDrive cloud
   *
   * @param {String} file's url.
   */
  fm.GDriveFileManager.prototype.readFile = function(url) {}

  /**
   * Write a file to GDrive
   *
   * @param {String} file's path.
   * @param {Array} ArrayBuffer object containing the file data.
   * @param {Function} optional callback whose argument is the response object.
   */
  fm.GDriveFileManager.prototype.writeFile = function(filePath, fileData, callback) {
    // callback to insert new file.
    function insertFile() {
      const boundary = '-------314159265358979323846';
      const delimiter = "\r\n--" + boundary + "\r\n";
      const close_delim = "\r\n--" + boundary + "--";

      var contentType = fileData.type || 'application/octet-stream';
      var name = fileData.name || url.substring(url.lastIndexOf('/') + 1);
      var metadata = {
        'title': name,
        'mimeType': contentType
      };

      var base64Data = btoa(fm.ab2str(fileData));
      var multipartRequestBody =
          delimiter +
          'Content-Type: application/json\r\n\r\n' +
          JSON.stringify(metadata) +
          delimiter +
          'Content-Type: ' + contentType + '\r\n' +
          'Content-Transfer-Encoding: base64\r\n' +
          '\r\n' +
          base64Data +
          close_delim;

      var request = gapi.client.request({
          'path': '/upload/drive/v2/files',
          'method': 'POST',
          'params': {'uploadType': 'multipart' /*resumable for more than 5MB files*/},
            'headers': {
              'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
            },
            'body': multipartRequestBody});
      if (!callback) {
        callback = function(fileResp) {
          console.log(fileResp)
        };
      }
      request.execute(callback);
    }

    if (!this.driveAPILoaded) {
      gapi.client.load('drive', 'v2', function() {
        insertFile();
        });
    } else {
      insertFile();
    }
  }


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


  /**
   * Convert ArrayBuffer to String
   *
   * @param {Array} input ArrayBuffer.
   */
  fm.ab2str = function(buf) {
    return String.fromCharCode.apply(null, new Uint16Array(buf));
  }

  /**
   * Convert String to ArrayBuffer
   *
   * @param {String} input string.
   */
  fm.str2ab = function(str) {
    var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
    var bufView = new Uint16Array(buf);

    for (var i=0, strLen=str.length; i &lt; strLen; i++) {
      bufView[i] = str.charCodeAt(i);
    }
    return buf;
  }

  /**
   * Split a file or folder path into an array
   *
   * @param {String} input path.
   */
  fm.path2array = function(path) {
    entries = path.split('/');
    // Throw out './' or '/' and move on to prevent something like '/foo/.//bar'.
    if (entries[0] == '.' || entries[0] == '') {
      entries = entries.slice(1);
    }
    return entries;
  }
