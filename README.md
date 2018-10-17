# Graphite API

The official Node API for Graphite Docs.

### Install

`npm i graphite-api`


###Usage

```
const { handleOAuthFlow, decryptPayload } = require("graphite-docs");

//redirect to sign in
handleOAuthFlow(targetURI, appName, redirectURI);

//This redirect will first generate a transit key pair, storing the private key to local storage and passing the public key to Graphite. Graphite will encrypt the return payload with the public key, and you can use the stored private key to decrypt it.

decryptPayload(token).then((payload) => {
  console.log(payload)
})
```
