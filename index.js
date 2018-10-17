import { decodeToken } from 'jsontokens';
const { createECDH } = require('crypto');
const { decryptECIES } = require('blockstack/lib/encryption');

module.exports = handleOAuthFlow = () => {
  const targetURI = 'http://localhost:3001/oauth/verify';
  const appName = encodeURI('React App');
  const redirectURI = encodeURI('localhost:3000');
  const ecdh = createECDH('secp256k1');
  const separator = '?';
  ecdh.generateKeys('hex');
  const pubKey = ecdh.getPublicKey('hex');
  const encodedPubKey = encodeURI(pubKey);
  const privKey = ecdh.getPrivateKey('hex');
  localStorage.setItem('graphite-transit-key', JSON.stringify(privKey));
  window.location.replace(targetURI + separator + appName + separator + redirectURI + separator + 'token=' + encodedPubKey + '=?');
}

module.exports = decryptPayload = (token) => {
  const privateKey = JSON.parse(localStorage.getItem('graphite-transit-key'));
  const tokenData = decodeToken(token);
  const payload = decryptECIES(privateKey, tokenData.payload);
  console.log(payload);
}
