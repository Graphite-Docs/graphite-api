# Graphite API

The official Node API for Graphite Docs.

***Important notes:***  
The Graphite API is in alpha state. In its current state, once a user grants permission to the app using the API, that app has permanent access. There will be a revocation method in the future, but that is not yet implemented.

It's important for Graphite users to understand that by granting access through the API to another application, they are providing that application with the following:
* Their application-specific (Graphite) private key  
* Their Blockstack Gaia Hub configuration file (including the read and write paths to the user's storage hub)
* The authorization response token, which when decoded can provide the user's ID-specific private key and public key

Users are encouraged to exercise extreme caution in deciding what apps to grant access to.

**This document is a work in progress**

### Install

`npm i graphite-api`


### Usage

```
import { handleOAuthFlow, decryptPayload } from 'graphite-docs';

//redirect to sign in
handleOAuthFlow(targetURI, appName, redirectURI);

//This redirect will first generate a transit key pair, storing the private key to local storage and passing the public key to Graphite. Graphite will encrypt the return payload with the public key, and you can use the stored private key to decrypt it.

//After redirect, a JSON Web Token will be passed back. Feed that token to the decryptPayload function and it will return the decrypted payload.
console.log(decryptPayload(token))
```

### API Docs

* Authentication
  * [OAuth Flow](#oauth-flow)
  * [Understanding the Payload](#understanding-the-payload)
  * [The Read Path](#the-read-path)
  * [The Write Path](#the-write-path)
* Reading Files
  * [Graphite Documents](#reading-graphite-documents)  
  * [Graphite Sheets](#reading-graphite-sheets)   
  * [Graphite Vault](#reading-graphite-vault)   
  * [Graphite Contacts](#reading-graphite-contacts)   
* Writing Files
  * [Graphite Documents](#writing-graphite-documents)  
  * [Graphite Sheets](#writing-graphite-sheets)   
  * [Graphite Vault](#writing-graphite-vault)   
  * [Graphite Contacts](#writing-graphite-contacts)  

### OAuth Flow

Graphite utilizes a similar authentication/access flow to the OAuth 2.0 standard. The differences are simply tied to the fact that all authentication and API access happens client side and users own their identity and data, not Graphite.

In order to kick off the authentication flow, you will need to trigger the `handleOAuthFlow()` function. This is usually done by wiring up a button that, when clicked, provides the necessary variables then makes the redirect to Graphite. There are three required variables that must be included in the `handleOAuthFlow()` function as an object:

1. Your Application Name  
2. Your Redirect URI
3. Your Graphite API Key (not implemented yet)

The function takes those variables in the form of an object as follows:

* appName [String]  
* redirectURI [String]
* apiKey [String]

Here is an example:

```
const object = {};
object.appName = "Super Cool App";
object.redirectURI = "https://appname.appdomain.com";
object.apiKey = "0221bd0bb646c069b5df70031b51fec31ea1ba9061e420616e49824ac5b8703077";
handleOAuthFlow(object)

//As soon as the function is called, the user should be redirected to Graphite to sign in and approve the authentication
```

In addition to redirecting the user to Graphite with the necessary information, a couple things happen on your app's side before the redirect happens. A transit key pair is generated (public key and private key). The private key is stored to the user's localStorage. The public key is passed along with the other options you included in your call to `handleOAuthFlow()`.

On Graphite's end, if the user approves authentication, the private information necessary to read and write files is encrypted with the public key that was passed over on the redirect to auth. That encrypted information is then encoded in a JSON web token and passed back through to your app as a URL parameter.

In order to decrypt and use the payload sent in the JSON web token, you will need to parse the token from the URL and then call `decryptPayload()` with that token. Here's an example:

```
const payload = decryptPayload(token);
console.log(JSON.parse(payload));
```

### Understanding The Payload

When the authentication flow is complete and you've received the payload, it's important to understand what you're looking at. You will have received an object back that includes the following:

* Public key
* Private key  
* A Blockstack Gaia Hub Config object

The public and private key pair are the specific keys associated with Graphite. They are not useful with any other app. This key pair is important because it is what should be used for encrypting new files (public key) and decrypting files you fetch from the user's storage hub (private key).

The Gaia Hub Config object includes the information that will make it easy for you to write to the user's Graphite storage hub if necessary. Here's an example config file:

```
{
  address: $address
  server: "https://hub.blockstack.org"
  token: $token
  url_prefix: "https://gaia.blockstack.org/hub/"
}
```

The address is combined with the url_prefix to create the read path address as covered in [The Read Path](#the-read-path). The server path is combined with the address to create the write path as covered in [The Write Path](#the-write-path). The token is the bearer token that will be used in making POST requests to the user's storage hub.

### The Read Path  

The read path is the path at which a user's documents are stored. It is derived from the user's Blockstack Gaia Hub Config object. The read path is a combination of url_prefix, which is the root of the read path, and the address which is the key specific to that user and to Graphite that identifies the correct storage hub to read from.

The read path alone is not enough to do anything with. You must also include the file path at the end. The Graphite API largely takes care of this for you, but here is an example read path that display a public Graphite document (not encrypted):

`https://gaia.blockstack.org/hub/1M16iy9tw9x2KAiwJZUGRvkkJC5adqmuZb/public/1531783110624.json`

### The Write Path

Similar to the read path, the write path is derived from the Blockstack Gaia Hub Config object. This is the path used if any new files are going to be created or if any existing file are to be updated. The write path is a combination of the server url from the config object and the address.

Just like with the read path, the write path requires a little more information beyond the server url and the address. An additional url path of `/store` is necessary, and so is the file name being created or updated. Here's an example write path:

`https://hub.blockstack.org/store/1M16iy9tw9x2KAiwJZUGRvkkJC5adqmuZb/public/1531783110624.json`

You won't be able to see anything at that address, but you would be able to write to that address if you had the correct bearer token. Again, this is largely handled by the Graphite API.

### Reading Graphite Documents  

Graphite documents are made up of two main components:

1. An index file that points to each individual file
2. A file that contains the actual content and additional meta data for the individual document

To fetch a document, you will first need to fetch the index file as the document ID will be necessary in eventually fetching it. The index file is located at the following path:

`$User-Storage-Path/documentscollection.json`

The storage path is obtained from the Authentication flow. See [The Read Path](#the-read-path). However, Graphite provides a convenient method for fetching the documents index file:

```
getCollection(object)
```

The `getCollection()` function takes an object with the properties of `docType`, `privateKey`, and `storagePath`.

* docType [String]
  * documents
  * sheets
  * vault
  * contacts  
* privateKey [String]
* storagePath [String]

**Make sure the `storagePath` does not have a trailing `/`.**

The private key is used to decrypt the file and is the same key received after the authentication flow was completed. Wherever that key was temporarily stored, you'll need to fetch it and pass it along with the other properties to the object for this function.

Here is an example call to get the documents index file:

```
const object = {};
object.docType = "documents";
object.privateKey = "029af140918274b366241cf830df9ca95144efd52bb3eafa69f569edf6abffcd08";
object.storagePath = "https://gaia.blockstack.org/hub/16KyUebBPPXgQLvA1f51bpsne3gL7Emdrc";

getCollection(object).then(data => {
  console.log(JSON.parse(data));
})

```

Once you have the index file, you can fetch a document based on the document's id. In the index file, a single document may look like this:

```
{
  title: "Name of document"
  updated: "11/1/2017"
  sharedWith: ["jehunter5811.id", "pbj.id"]
  tags: ["One", "Two"]
  id: 123456789
}
```

The id property is what you'll need to make the call to fetch the individual document. Similar to the `getCollection()` function, the `getFile()` function takes an object. This object **must** have the properties of `docType`, `storagePath`, `privateKey`, and `id`.

* docType [String]
  * documents
  * sheets
  * vault
  * contacts  
* storagePath [String]
* privateKey [String]
* id [String]

**Make sure the `storagePath` does not have a trailing `/`.**

The important thing to note from the above is that the id, while it might be a number in the JSON from the index file, will need to be passed in as a string.

Here is an example call to fetch a single document:

```
const object = {};
object.docType = "documents";
object.storagePath = "https://gaia.blockstack.org/hub/16KyUebBPPXgQLvA1f51bpsne3gL7Emdrc";
object.privateKey = '029af140918274b366241cf830df9ca95144efd52bb3eafa69f569edf6abffcd08';
object.id = "123456789";

getCollection(object).then(data => {
  console.log(JSON.parse(data));
})
```

### Reading Graphite Sheets

Graphite sheets are made up of two main components:

1. An index file that points to each individual file
2. A file that contains the actual content and additional meta data for the individual document

To fetch a document, you will first need to fetch the index file as the document ID will be necessary in eventually fetching it. The index file is located at the following path:

`$User-Storage-Path/sheetscollection.json`

The storage path is obtained from the Authentication flow. See [The Read Path](#the-read-path). However, Graphite provides a convenient method for fetching the documents index file:

```
getCollection(object)
```

The `getCollection()` function takes an object with the properties of `docType`, `privateKey`, and `storagePath`.

* docType [String]
  * documents
  * sheets
  * vault
  * contacts  
* privateKey [String]
* storagePath [String]

**Make sure the `storagePath` does not have a trailing `/`.**

The private key is used to decrypt the file and is the same key received after the authentication flow was completed. Wherever that key was temporarily stored, you'll need to fetch it and pass it along with the other properties to the object for this function.

Here is an example call to get the sheets index file:

```
const object = {};
object.docType = "sheets";
object.privateKey = "029af140918274b366241cf830df9ca95144efd52bb3eafa69f569edf6abffcd08";
object.storagePath = "https://gaia.blockstack.org/hub/16KyUebBPPXgQLvA1f51bpsne3gL7Emdrc";

getCollection(object).then(data => {
  console.log(JSON.parse(data));
})

```

Once you have the index file, you can fetch a document based on the document's id. In the index file, a single document may look like this:

```
{
  title: "Name of Sheet"
  updated: "11/1/2017"
  sharedWith: ["jehunter5811.id", "pbj.id"]
  tags: ["One", "Two"]
  id: 123456789
}
```

The id property is what you'll need to make the call to fetch the individual sheet. Similar to the `getCollection()` function, the `getFile()` function takes an object. This object **must** have the properties of `docType`, `storagePath`, `privateKey`, and `id`.

* docType [String]
  * documents
  * sheets
  * vault
  * contacts  
* storagePath [String]
* privateKey [String]
* id [String]

**Make sure the `storagePath` does not have a trailing `/`.**

The important thing to note from the above is that the id, while it might be a number in the JSON from the index file, will need to be passed in as a string.

Here is an example call to fetch a single document:

```
const object = {};
object.docType = "sheets";
object.storagePath = "https://gaia.blockstack.org/hub/16KyUebBPPXgQLvA1f51bpsne3gL7Emdrc";
object.privateKey = '029af140918274b366241cf830df9ca95144efd52bb3eafa69f569edf6abffcd08';
object.id = "123456789";

getCollection(object).then(data => {
  console.log(JSON.parse(data));
})
```

### Reading Graphite Vault

Under construction - coming soon!

### Reading Graphite Contacts  

Under construction - coming soon!

### Writing Graphite Documents  

Under construction - coming soon!

### Writing Graphite Sheets

Under construction - coming soon!

### Writing Graphite Vault  

Under construction - coming soon!

### Writing Graphite Contacts  
