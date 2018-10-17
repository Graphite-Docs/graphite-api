# Graphite API

The official Node API for Graphite Docs.

### Install

`npm i graphite-api`


### Usage

```
<<<<<<< HEAD
import { handleOAuthFlow, decryptPayload } from 'graphite-docs';
=======
import { handleOAuthFlow, decryptPayload }  from 'graphite-docs';
>>>>>>> d9425f0cd3eebc1a691f65aa2a5eb303e8a32006

//redirect to sign in
handleOAuthFlow(targetURI, appName, redirectURI);

//This redirect will first generate a transit key pair, storing the private key to local storage and passing the public key to Graphite. Graphite will encrypt the return payload with the public key, and you can use the stored private key to decrypt it.

//After redirect, a JSON Web Token will be passed back. Feed that token to the decryptPayload function and it will return the decrypted payload.
console.log(decryptPayload(token))
```
