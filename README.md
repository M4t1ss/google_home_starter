## Google Home Window Opener Service

### Getting Started
If you haven't already, install git and node.js on your device.

### Requirements
#### Rrb3 package
* `sudo pip install rrb3`

#### Node js
* `wget https://nodejs.org/dist/v8.9.0/node-v8.9.0-linux-armv6l.tar.gz`
* `tar -xzf node-v8.9.0-linux-armv6l.tar.gz`
* `cd node-v8.9.0-linux-armv6l/`
* `sudo cp -R * /usr/local/`
* `sudo npm install forever -g`
* `sudo npm install axios`

#### Service
(more info https://www.instructables.com/id/Nodejs-App-As-a-RPI-Service-boot-at-Startup/)

Note that this repository should be cloned in `/home/pi/tools`, which is hardcoded in the `service/googleHome` file. 
If you use a different directory, be sure to change that in the `googleHome` file.

* `sudo cp service/googleHome /etc/init.d/`
* `sudo chmod 755 /etc/init.d/googleHome`
* `sudo update-rc.d googleHome defaults`

#### First Time
1. Fork or clone this repository onto your device. 
2. In your console, run `npm install` to install the required components.
3. Run `touch .env` to create your hidden, gitignored environment config file.
4. In .env, configure your environment as follows:
    * `DEV=`  `TRUE` if you are on desktop, or `FALSE` if you are on your raspberry pi
    * `PORT=` `8000` for development, `80` or `443` for HTTP or HTTPS
    * `PASS=` Whatever you want your password to be
5. Run `npm start` to launch the server

When you make a POST request to the server, follow this structure: 
`http://ipaddresshere/API/switches/sw1?password=yourpasswordhere`

### Next Steps
You will want to configure the Python files to suit your project's needs. 

To add or edit a switch, go into saveState.json. Use the first switch as a guide, and add a new object to the switches array. 

You can serve your own frontend out of the public folder, and it will be accessible on the root route if you make a get request to your IP address. 
