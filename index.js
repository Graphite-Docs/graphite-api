import { decodeToken } from 'jsontokens';
import axios from 'axios';
const { createECDH } = require('crypto');
const { decryptECIES } = require('blockstack/lib/encryption');

export function handleOAuthFlow(object) {
  const ecdh = createECDH('secp256k1');
  const separator = '?';
  ecdh.generateKeys('hex');
  const pubKey = ecdh.getPublicKey('hex');
  const encodedPubKey = encodeURI(pubKey);
  const privKey = ecdh.getPrivateKey('hex');
  localStorage.setItem('graphite-transit-key', JSON.stringify(privKey));
  window.location.replace(object.targetURI + separator + object.appName + separator + object.redirectURI + separator + 'token=' + encodedPubKey + '=?');
};

export function decryptPayload(token) {
  const privateKey = JSON.parse(localStorage.getItem('graphite-transit-key'));
  const tokenData = decodeToken(token);
  const payload = decryptECIES(privateKey, tokenData.payload);
  return payload;
};

export function getCollection(object) {
  if(object.docType === "documents") {
    return axios.get(object.storagePath + '/documentscollection.json')
      .then((res) => {
        return JSON.parse(decryptECIES(object.privateKey, res.data)).value;
      })
      .catch(error => {
        console.log(error);
      })
  } else if(object.docType === "sheets") {
    return axios.get(object.storagePath + '/sheetscollection.json')
      .then((res) => {
        return JSON.parse(decryptECIES(object.privateKey, res.data)).sheets;
      })
      .catch(error => {
        console.log(error);
      })
  } else if(object.docType === "vault") {
    return axios.get(object.storagePath + '/uploads.json')
      .then((res) => {
        return JSON.parse(decryptECIES(object.privateKey, res.data));
      })
      .catch(error => {
        console.log(error);
      })
  } else if(object.docType === "contacts") {
    return axios.get(object.storagePath + '/contact.json')
      .then((res) => {
        return JSON.parse(decryptECIES(object.privateKey, res.data)).contacts;
      })
      .catch(error => {
        console.log(error);
      })
  }
}

export function getFile(object) {
  if(object.docType === "documents") {
    return axios.get(object.storagePath + '//documents/' + object.id + '.json')
      .then((res) => {
        return JSON.parse(decryptECIES(object.privateKey, res.data));
      })
      .catch(error => {
        console.log(error);
      })
  } else if(object.docType === "sheets") {
    return axios.get(object.storagePath + '//sheets/' + object.id + '.json')
      .then((res) => {
        return JSON.parse(decryptECIES(object.privateKey, res.data));
      })
      .catch(error => {
        console.log(error);
      })
  } else if(object.docType === 'vault') {
    return axios.get(object.storagePath + '/' + object.id + '.json')
      .then((res) => {
        return JSON.parse(decryptECIES(object.privateKey, res.data));
      })
      .catch(error => {
        console.log(error);
      })
  }
}
