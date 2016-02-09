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
TBC

## Technologies
- [Meteor](https://www.meteor.com/)
- [Semantic UI](http://semantic-ui.com/)

## Project Structure

Directory | Purpose
----------|-----------------------------------
lib/      | Client and server shared functions,
          | such as application routes and data schemas.
public/   | Files to serve directly to client,
          | such as favicon.ico or robots.txt.
server/   | Code to only execute on the server only.
          | Never exposed to the client. This would hold security configurations.        
client/   | Client side code; including interface functions and CSS.
          | Contains further nested folders:
----------|-----------------------------------
          | templates/    | Contains HTML partials for use in the interface.
----------|---------------|-------------------
          | compatibility/| Modules that rely on exporting global objects,
          |               | and can’t be minified.
----------|---------------|-------------------
          | lib/          | SCSS components and reused JS functions.
----------|---------------|-------------------
builds/   | Self-contained application binaries for production testing and deployment.

## License
MIT
