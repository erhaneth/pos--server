# dettiPOS - Server

This is the server of the dettiPOS system. To find out more about this project, view the detailed README on the client [Github Repository](https://github.com/saulthebear/pos-client).

## Description

This server was built using the [Express](https://expressjs.com/) framework. It is a simple, but powerful web server that can be used to serve static files and handle dynamic requests. It serves to send and receive data from the React front-end client and the database.

## Installation Instructions

1. Fork and clone this repo
2. Run `npm i` to install all dependencies
3. Ensure MongoDB is running and accessible
4. Create a `.env` file. Add a `JWT_SECRET` environment variable in that file. This is used to sign and verify the JWT tokens used for authentication.
5. Run `node server.js` to start the server.
6. Follow the installation instructions for the [client](https://github.com/saulthebear/pos-client).

# Authors

[Grace](https://github.com/gracenarez333) | [Stefan](https://github.com/saulthebear) | [Heg](https://github.com/erhaneth)
