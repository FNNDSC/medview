# medview

[![Join the chat at https://gitter.im/FNNDSC/medview](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/FNNDSC/medview?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Medview viewer is a distributed collaborative neuroimage visualization application that is
delivered to the users over the web without requiring the installation of any additional software
or browser plugging. This not only enhances accessibility and usability for the end-users but
automatically provides them with the latest application updates without requiring any technological
skills or administrator-level access to their computing devices.

The viewer presents a simple tab-based interface that let users drag and drop multiple neuroimage files
(even folders in the case of the Chrome browser) in the content space of the main "Load files" tab for
their quick visualization in a second newly created tab that immediately becomes active. The user can
repeatedly switch back to the main tab and load more files that will be visualized in subsequent newly
created tabs. Each tab has an independent [viewerjs.Viewer](https://github.com/FNNDSC/viewerjs)
visualization object (VObj) embedded and all of them are attached to the same single HTML page. An
existing tab can then be closed by clicking its cross icon which automatically destroys the corresponding
VObj and removes from the page all the HTML elements associated with the tab.

The user can start a realtime collaboration session from any of the visualization tabs as the collaboration owner. He/She can also joint to an existing collaboration session by pressing the "Enter existing collab
room" button, entering the session id in the "room id" input and then clicking the "Go!" button. The Google’s
login and authorization windows will then pop up and after successful completion a new visualization tab is
created as before. However in this case the neuroimage data are remotely accessed from GDrive rather than
locally.

Please take a look at the [viewerjs.Viewer's wiki](https://github.com/FNNDSC/viewerjs/wiki) to learn how
to interact with the embedded VObj through peripheral device controls.

A stable version of the web application is available here: <http://medview.babymri.org>.

A dev version the web application is available here: <http://fnndsc.github.io/medview/>.

Note that in some cases both of these versions might be identical; however the dev version will typically change first before that is rolled out to stable.

## Build
This project uses grunt.

### Pre-requisites:
* NodeJs - http://nodejs.org/

#### Ubuntu / Debian

On Ubuntu type systems, you might need to also install legacy node support:

````
sudo apt-get install nodejs-legacy
````

#### Install npm support

* Ensure that your npm is up-to-date:

````
sudo npm update -g npm
````

* Install grunt's command line interface (CLI) globally:

````
sudo npm install -g grunt-cli
````

* Install bower:

````
sudo npm install -g bower
````

#### Post npm issues

If you encounter issues with permissions (unable to mkdir for example) when you run npm as yourself, make sure that in your home dir that the npm tree is owned by you:

````
cd ~
sudo chown -R $(whoami) ~/.npm
````

### Clone

Directly with ssh

````
git clone git@github.com:FNNDSC/medview.git
````

or, with https

````
https://github.com/FNNDSC/medview.git
````

Once you've cloned the repo, you'll need to build the subcomponents.

### Install components (<tt>viewerjs</tt>)

The following are run from the checked out <tt>medview</tt> directory.

* Install grunt and gruntplugins packages that are needed for development and building. These are defined in <tt>package.json</tt>:

````
npm install
````

* Now install the medview source dependencies listed in bower.json:

````
bower install
````

* Run grunt to test and build the project:

````
grunt
````

The production web app is built within the directory <tt>dist</tt>.
