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

#### Reading Graphite Documents  

Graphite documents are made up of two main components:

1. An index file that points to each individual file
2. A file that contains the actual content and additional meta data for the individual document

To fetch a document, you will first need to fetch the index file as the document ID will be necessary in eventually fetching it. The index file is located at the following path:

`$User-Storage-Path/documentscollection.json`

The storage path is obtained from the Authentication flow. See [The Read Path](#the-read-path). However, Graphite provides a convenient method for fetching the documents index file:

```
getCollection(object)
```

The `getCollection()` function takes an object with the properties of `docType` and `storagePath`.

* docType [String]
  * documents
  * sheets
  * vault
  * contacts  
* storagePath [String]

Here is an example call to get the documents index file:

```
const object = {};
object.docType = "documents";
object.storagePath = "https://gaia.blockstack.org/hub/16KyUebBPPXgQLvA1f51bpsne3gL7Emdrc"

getCollection(object)

//returns JSON with an array of documents

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

The id property is what you'll need to make the call to fetch the individual document. Similar to the `getCollection()` function, the `getFile()` function takes an object. This object **must** have the properties of `docType` and `id`.

* docType [String]
  * documents
  * sheets
  * vault
  * contacts  
* id [String]

The important thing to note from the above is that the id, while it might be a number in the JSON from the index file, will need to be passed in as a string.

Here is an example call to fetch a single document:

```
const object = {};
object.docType = "documents";
object.id = "123456789";
getFile(object)

//Returns JSON with the file's data
```
