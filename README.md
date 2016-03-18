# WebMark
A Meteor powered Web Application to enable efficient and flexible marking of assignments.

## Table of Contents

- [About](#about)
- [Installation](#installation)
- [Technologies](#technologies)
- [License](#license)

## About
Final year project for BSc Computer Science by Merlin Govier (UP663652) at the University of Portsmouth.

Based on requirements learned through meeting experienced lecturers and analyzing current tools.

## Installation

### Developer
- Install [Meteor](https://www.meteor.com/)
- Clone this repo, in your terminal `cd` into the root folder, and run `meteor`!

### Production
A deployment guide is available in the project document.
- Running `meteor build` will generate a node server package. Currently requires the Node 0.10.x branch.
- To enable TLS support, a terminator such as HAProxy or nginx should be configured as a reverse proxy.
- Startup MongoDB.
- Configure Meteor environment variables for root url, proxy, and Mongo.

## Technologies
- [Meteor](https://www.meteor.com/)
- [Semantic UI](http://semantic-ui.com/)

## Project Structure

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

## License
MIT
