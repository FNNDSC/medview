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

  fm.AbstractFileManager.prototype.requestFileSystem = fm.abstractmethod;

  fm.AbstractFileManager.prototype.isFile = fm.abstractmethod;

  fm.AbstractFileManager.prototype.readFile = fm.abstractmethod;

  fm.AbstractFileManager.prototype.writeFile = fm.abstractmethod;

  fm.AbstractFileManager.prototype.createPath = fm.abstractmethod;


  /**
   * Concrete class implementing a file manager for the local FS.
   * Currently uses the HTML5's sandboxed FS API (only implemented in Chrome)
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
   *
   * @param {Function} callback to be called when the API is ready.
   */
  fm.LocalFileManager.prototype.requestFileSystem = function(callback) {
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
        callback();
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
    var self = this;

    function createPath() {

      function createFolder(rootDirEntry, folders) {

        function errorHandler(e) {
          console.log('Could not create path. Error code: ' + e.code);
          if (callback) {
            callback(null);
          }
        }

        // exclusive:false means if the folder already exists then don't throw an error
        rootDirEntry.getDirectory(folders[0], {create: true, exclusive:false}, function(dirEntry) {
          // Recursively add the new subfolder (if we still have another to create).
          folders = folders.slice(1);
          if (folders.length) {
            createFolder(dirEntry, folders);
          } else if (callback) {
            callback(dirEntry);
          }
        }, errorHandler);

      }

      folders = fm.path2array(path);
      createFolder(self.fs, folders); // fs.root is a DirectoryEntry

    }

    if (this.fs) {
      createPath();
    } else {
      this.requestFileSystem(createPath);
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
    var self = this;

    function findFile() {

      function errorHandler(e) {
        console.log('File not found. Error code: ' + e.code);
        callback(null);
      }

      self.fs.root.getFile(filePath, {create: false}, function(fileEntry) {
        // Get a File object representing the file,
        fileEntry.file(function(fileObj) {
          callback(fileObj);
        }, errorHandler);
      }, errorHandler);
    }

    if (this.fs) {
      findFile();
    } else {
      this.requestFileSystem(findFile);
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
    var self = this;

    function readFile() {

      function errorHandler(e) {
        console.log('Could not read file. Error code: ' + e.code);
        callback(null);
      }

      self.fs.root.getFile(filePath, {create: false}, function(fileEntry) {
        // Get a File object representing the file,
        fileEntry.file(function(fileObj) {
          var reader = new FileReader();

          reader.onload = function(ev) {
            callback(this.result);
          }

          reader.readAsArrayBuffer(fileObj);
        }, errorHandler);
      }, errorHandler);

    }

    if (this.fs) {
      readFile();
    } else {
      this.requestFileSystem(readFile);
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
    var self = this;

    function checkPathAndWriteFile() {

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

      var basedir = filePath.substring(0, filePath.lastIndexOf('/'));
      self.fs.getDirectory(basedir, {create: false}, function(dirEntry) {
        writeFile();
      }, function (e) {if (e.code === FileError.NOT_FOUND_ERR) {
        self.createPath(basedir, writeFile);} else {
          errorHandler(e);
        }} );
    }

    if (this.fs) {
      checkPathAndWriteFile();
    } else {
      this.requestFileSystem(checkPathAndWriteFile);
    }

  }


  /**
   * Concrete class implementing a file manager for Google Drive.
   * Uses Google Drive's API
   */
  fm.GDriveFileManager = function() {
    // Google's ID for this app
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
   * Load GDrive API
   *
   * @param {Function} callback to be called when the API is ready.
   */
  fm.GDriveFileManager.prototype.requestFileSystem = function(callback) {
    var self = this;

    if (!this.driveAPILoaded) {
      gapi.client.load('drive', 'v2', function() {
        self.driveAPILoaded = true;
        callback();
    });

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

    function createPath() {

      function createFolder(rootResp, folders) {
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
                createFolder(resp, folders);
              } else if (callback) {
                callback(resp);
              }
            });

          } else {
            folders = folders.slice(1);
            if (folders.length) {
              // recursively create subsequent folders if needed
              createFolder(findResp.items[0], folders);
            } else if (callback) {
              callback(findResp.items[0]);
            }
          }
        });

      }

      folders = fm.path2array(path);
      if (folders.length) {
        createFolder({'id': 'root'}, folders);
      } else if (callback) {
        callback(null);
      }
    }

    if (this.driveAPILoaded) {
      createPath();
    } else {
      this.requestFileSystem(createPath);
    }

  }

  /**
   * Determine whether a file exists in the GDrive cloud
   *
   * @param {String} file's path.
   * @param {Function} callback whose argument is the file response object if
   * found or null otherwise.
   */
  fm.GDriveFileManager.prototype.isFile = function(filePath, callback) {

    function findFile() {

      function findEntry(rootResp, entries) {
        var findRequest;

        // list entry with name entry[0] if it exists. The search request depends
        // on whether we are at the filename entry or at an ancestor folder
        if (entries.length == 1) {
          findRequest = gapi.client.drive.children.list({
            'folderId': rootResp.id,
            'q': "mimeType!='application/vnd.google-apps.folder' and title='" + entries[0] + "'"
          });
        } else {
          findRequest = gapi.client.drive.children.list({
            'folderId': rootResp.id,
            'q': "mimeType='application/vnd.google-apps.folder' and title='" + entries[0] + "'"
          });
        }

        findRequest.execute(function(findResp) {

          if (findResp.items.length==0) {

            console.log('File not found!');
            if (callback) {
              callback(null);
            }

          } else {

            // Entry was found! Check if there are more entries
            entries = entries.slice(1);
            if (entries.length) {
              // Recursively move to subsequent entry
              findEntry(findResp.items[0], entries);
            } else if (callback) {
              // No more entries, current entry is the file
              // Request file response object (resource)
              var request = gapi.client.drive.files.get({
                'fileId': findResp.items[0].id
              });
              request.execute(function(resp) {
                callback(resp);
              });
            }

          }

        });

      }

      entries = fm.path2array(filePath);
      if (entries.length) {
        findEntry({'id': 'root'}, entries);
      } else if (callback) {
        callback(null);
      }

    }

    if (this.driveAPILoaded) {
      findFile();
    } else {
      this.requestFileSystem(findFile);
    }

  }

  /**
   * Read a file from the GDrive cloud
   *
   * @param {String} file's path.
   * @param {Function} callback whose argument is the file data if the file is
   * successfuly read or null otherwise.
   */
  fm.GDriveFileManager.prototype.readFile = function(filePath, callback) {

    this.isfile(filePath, function (fileResp) {

      if (fileResp) {
        var accessToken = gapi.auth.getToken().access_token;
        var xhr = new XMLHttpRequest();

        xhr.open('GET', fileResp.downloadUrl);
        xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);

        // Response handlers.
        xhr.onload = function() {
          // convert from base 64 encoded string to ArrayBuffer
          var fileData = fm.str2ab(atob(xhr.responseText));
          callback(fileData);
        };

        xhr.onerror = function() {
            console.log('Could not read file: ' + fileResp.title + ' with id: ' + fileResp.id);
        };

        xhr.send();

      } else if (callback) {
        callback(null);
      }

    });

  }

  /**
   * Given a file id read the file from the GDrive cloud if authorized. Can read
   * a file from another user's GDrive if read permission has been granted to the
   * current user.
   *
   * @param {String} file's id.
   * @param {Function} callback whose argument is the file data if the file is
   * successfuly read or null otherwise.
   */
  fm.GDriveFileManager.prototype.readFileByID = function(fileID, callback) {
    var self = this;

    function downloadFile() {

      var copyRequest = gapi.client.drive.files.copy({
        'fileId': fileID,
        'resource': {'title': 'tempGDriveFile.tmp'}
      });

      copyRequest.execute(function(copyResp) {
        self.readFile('tempGDriveFile.tmp', function (dataResp) {
          callback(dataResp);
          // Permanently delete the temporal file, skipping the trash.
          var delRequest = gapi.client.drive.files.delete({
            'fileId': copyResp.id
          });
          delRequest.execute(function(delResp) { console.log(delResp);});
        });
      });

    }

    if (this.driveAPILoaded) {
      downloadFile();
    } else {
      this.requestFileSystem(downloadFile);
    }

  }

  /**
   * Write a file to GDrive
   *
   * @param {String} file's path.
   * @param {Array} ArrayBuffer object containing the file data.
   * @param {Function} optional callback whose argument is the file response object.
   */
  fm.GDriveFileManager.prototype.writeFile = function(filePath, fileData, callback) {

    // callback to insert new file.
    function writeFile(baseDirResp) {

      const boundary = '-------314159265358979323846';
      const delimiter = "\r\n--" + boundary + "\r\n";
      const close_delim = "\r\n--" + boundary + "--";

      var contentType = fileData.type || 'application/octet-stream';
      var name = fileData.name || url.substring(url.lastIndexOf('/') + 1);
      var metadata = {
        'title': name,
        'mimeType': contentType,
        'parents': [{'id': baseDirResp.id}]
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

    var basedir = filePath.substring(0, filePath.lastIndexOf('/'));
    this.createPath(basedir, writeFile);
  }

  /**
   * Share a file in current users's GDrive with another GDrive user identified
   * by it's email address.
   *
   * @param {String} file's path.
   * @param {Function} optional callback whose argument is the shared file
   * response object if found or null otherwise.
   */
  fm.GDriveFileManager.prototype.shareFile = function(filePath, userMail, callback) {

    this.isfile(filePath, function (fileResp) {
      if (fileResp) {
        var request = gapi.client.drive.permissions.insert({
          'fileId': fileResp.id,
          'resource': {'value': userMail, 'type': 'user', 'role': 'reader'}
          });
        request.execute(function(resp) {if (callback) {callback(resp);}});
      } else if (callback) {
        callback(null);
      }
    });

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
   * Load Dropbox API
   *
   * @param {Function} callback to be called when the API is ready.
   */
  fm.DropboxFileManager.prototype.requestFileSystem = function(callback) {

  }

  /**
   * Create a new directory path in the Dropbox cloud
   *
   * @param {String} new absolute path to be created.
   * @param {Function} optional callback whose argument is the folder creation
   * response object or null otherwise.
   */
  fm.DropboxFileManager.prototype.createPath = function(path, callback) {

  }

  /**
   * Determine whether a file exists in the Dropbox cloud
   *
   * @param {String} file's path.
   * @param {Function} callback whose argument is the file response object if
   * found or null otherwise.
   */
  fm.DropboxFileManager.prototype.isFile = function(filePath, callback) {

  }

  /**
   * Read a file from the Dropbox cloud
   *
   * @param {String} file's path.
   * @param {Function} callback whose argument is the file data if the file is
   * successfuly read or null otherwise.
   */
  fm.DropboxFileManager.prototype.readFile = function(filePath, callback) {

  }

  /**
   * Write a file to Dropbox
   *
   * @param {String} file's path.
   * @param {Array} ArrayBuffer object containing the file data.
   * @param {Function} optional callback whose argument is the response object.
   */
  fm.DropboxFileManager.prototype.writeFile = function(filePath, fileData, callback) {

  }

  /**
   * Convert ArrayBuffer to String
   *
   * @param {Array} input ArrayBuffer.
   */
  fm.ab2str = function(buf) {
    return String.fromCharCode.apply(null, new Uint8Array(buf)); // 1 byte for each char
  }

  /**
   * Convert String to ArrayBuffer
   *
   * @param {String} input string.
   */
  fm.str2ab = function(str) {
    var buf = new ArrayBuffer(str.length); // 1 byte for each char
    var bufView = new Uint8Array(buf);

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
