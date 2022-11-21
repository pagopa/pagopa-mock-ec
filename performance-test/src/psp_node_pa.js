// 1. init code (once per VU)
// prepares the script: loading files, importing modules, and defining functions

import { check } from 'k6';
import { SharedArray } from 'k6/data';
import { primitive } from './helpers/helper.js';

export let options = JSON.parse(open(__ENV.TEST_TYPE));

// read configuration
// note: SharedArray can currently only be constructed inside init code
// according to https://k6.io/docs/javascript-api/k6-data/sharedarray
const varsArray = new SharedArray('vars', function () {
	return JSON.parse(open(`./${__ENV.VARS}`)).environment;
});
// workaround to use shared array (only array should be used)
const vars = varsArray[0];
const rootUrl = `${vars.nodeHost}`;
const env = `${vars.env}`;
const primitives = vars.primitives;

export default function psp_node_pa() {
	const soapAction = 'verifyPaymentNotice';
	let headers = {
		'SOAPAction': soapAction,
		'Content-Type': 'application/xml'
	}

	if (env !== "local") {
		headers['Ocp-Apim-Subscription-Key'] = __ENV.API_SUBSCRIPTION_KEY;
	}

	const params = {
		headers: headers,
	};

	let payload = primitives[soapAction];
	for (let key of Object.keys(__ENV)) {
		payload = payload.replace(key, __ENV[key]);
	}

	let response = primitive(rootUrl, payload, params);
	let responseData = {};
	responseData[soapAction] = (response) => response.status === 200;
	check(response, responseData);
}
