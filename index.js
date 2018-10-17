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
    axios.get(object.storagePath + '/documentscollection.json')
      .then((res) => {
        return decryptECIES(object.privateKey, res.data)
      })
      .catch(error => {
        console.log(error);
      })
  }
}

export function getFile(object) {
  if(object.docType === "documents") {
    axios.get(object.storagePath + '//documents/' + object.id + '.json')
      .then((res) => {
        return decryptECIES(object.privateKey, res.data)
      })
      .then(error => {
        console.log(error);
      })
  }
}
