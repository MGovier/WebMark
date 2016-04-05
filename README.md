# WebMark
A Meteor powered Web Application to enable efficient and flexible marking of assignments.

## Table of Contents

- [About](#about)
- [User Guide](#user)
- [Developer Guide](#developer)
- [Deployment](#installation)
- [Technologies](#technologies)
- [License](#license)

## About
Final year project for BSc Computer Science by Merlin Govier (UP663652) at the University of Portsmouth.

Based on requirements learned through meeting experienced lecturers and analyzing current tools.

## User Guide
The [user guide](https://mgovier.github.io/WebMark/user/) details how to use the application as an end-user.

## Developer Guide
- Install [Meteor](https://www.meteor.com/). Requires v1.3+.
- Clone this repo, in your terminal `cd` into the root folder.
- Run `meteor npm install` to install node dependencies, then `meteor` to locally serve the application.

### Code Style & Linting
This project aims to follow the [Meteor Guide Code Style](http://guide.meteor.com/code-style.html). Linting uses ESLint, with Airbnb's configuration. Run `meteor npm run lint` to check.

### Project Structure
Directory | Purpose                           
----------|-----------------------------------
lib/      | Client and server shared functions, such as application routes and data schemas.
public/   | Files to serve directly to client, such as favicon.ico or robots.txt.
server/   | Code to only execute on the server only. This holds security configurations.
client/   | Client side code; including interface functions and CSS. Contains:
          | **templates/**    : Contains HTML partials for use in the interface.
          | **compatibility/**  : Modules that rely on exporting global objects.
          | **lib/**         : SCSS components and reused JS functions.
          | **controllers/** : JS functionality.
builds/   | Self-contained application bundles for production testing and deployment.


## Deployment
The application utilizes a Node.JS powered server, connected to MongoDB and running behind a reverse proxy TLS terminator.

The most recent versions tested successfully are shown below:

Requirement | Version
------------|-----------------------------
[Node.JS](https://nodejs.org/en/)   | 0.10.44
[MongoDB](https://www.mongodb.com/) | 3.2
[Nginx](http://nginx.org/en/)       | 1.9.14

As of 1.3.1, Meteor requires the 0.10 Node.JS branch, but this may change in future releases. The most recent versions of other technologies should be compatible.


### Node.JS Server
Meteor can produce a self-contained NodeJS bundle. To generate this, use `meteor build` from inside the project directory. If you will be deploying onto a different platform than that which you are currently on, specify which with the `--architecture` flag.

Environment variables are required for the Meteor application:
Variable                | Setting
------------------------|-----------------------------------
ROOT_URL                | The domain path for the application, such as `https://example.com/marking`.
HTTP_FORWARDED_COUNT    | Number of reverse proxies deployed in from of Node.JS - i.e. `1`.
PORT                    | Port to run on. This should match the reverse proxy's expected local address, such as 3000.
NODE_ENV                | `production` for running in production.
MONGO_URL               | Address for the MongoDB server. Follows pattern `mongodb://user:password@host:port/databasename`.


### MongoDB
Ensure MongoDB can only be accessed locally, and set suitable users with restricted roles.

### Reverse Proxy & Security
A good configuration for the TLS terminator can be sourced from the [Mozilla SSL Configuration Generator](https://mozilla.github.io/server-side-tls/ssl-config-generator/) and following [Remy van Elst's Nginx Security Advice](https://raymii.org/s/tutorials/Strong_SSL_Security_On_nginx.html). This requires a stronger Diffie-Hellman parameter than the default, which can be generated using
```
cd /etc/ssl/certs
openssl dhparam -out dhparam.pem 4096
```
[This Gist](https://gist.github.com/MGovier/5112025ec482012163c6d563dd75ca32) shows the configuration used for production testing, and features redirects from both `http` and `www.` to `https` and `non-www`.

Direct internet/public access to the Node.JS or MongoDB services should be prevented, potentially through firewall configuration.

### Docker
The services can be managed using Docker and Docker Compose. Nginx can be configured as above, and an example configuration for the Node.JS server is:

#### Dockerfile
```
FROM node:0.10
ENV ROOT_URL="https://example.me"
ENV HTTP_FORWARDED_COUNT=1
ENV PORT=3000
ENV NODE_ENV=production
ENV MONGO_URL="mongodb://user:pass@mongo:27017/WebMark"
EXPOSE 3000
ADD WebMark.tar.gz /WebMark/
RUN (cd WebMark/bundle/programs/server && npm install)
```
#### Start script (run `sh start`)
```
docker rm -f webmark-host
docker build -t webmark-image .
docker run --name webmark-host --link mongo-host:mongo -p 127.0.0.1:3000:3000 --restart=always -d webmark-image node /WebMark/bundle/main.js
```

## License
MIT
