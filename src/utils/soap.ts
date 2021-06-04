// TODO: Duplicated file with pagopa-proxy
import * as fs from 'fs';
import { NonEmptyString } from 'italia-ts-commons/lib/strings';
import * as soap from 'soap';

// type signature for callback based async soap methods
export type SoapMethodCB<I, O> = (
  input: I,
  cb: (
    // tslint:disable-next-line: no-any
    err: any,
    result: O,
    raw: string,
    // tslint:disable-next-line: no-any
    soapHeader: { readonly [k: string]: any },
  ) => unknown,
  options?: Pick<soap.ISecurity, 'postProcess'>,
) => void;

/**
 * Retrieve wsdl file content
 * @param {NonEmptyString} path - WSDL file path
 * @return {Promise<string>} WSDL file content
 */
export async function readWsdl(path: NonEmptyString): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    fs.readFile(path, { encoding: 'UTF-8' }, (err, wsdl) => {
      if (err) {
        return reject(err);
      }
      resolve(wsdl.replace(/(\r\n|\n|\r)/gm, ''));
    });
  });
}

export function createClient<T>(
  wsdlUri: string,
  options: soap.IOptions,
  cert?: string,
  key?: string,
  hostHeader?: string,
): Promise<soap.Client & T> {
  return new Promise((resolve, reject) => {
    soap.createClient(wsdlUri, options, (err, client) => {
      if (err) {
        reject(err);
      } else {
        if (cert !== undefined && key !== undefined) {
          client.setSecurity(new soap.ClientSSLSecurity(Buffer.from(key), Buffer.from(cert)));
        }

        if (hostHeader !== undefined) {
          client.addHttpHeader('Host', hostHeader);
        }
        resolve(client as soap.Client & T); // tslint:disable-line:no-useless-cast
      }
    });
  });
}

/**
 * Converts a SoapMethodCB into a SoapMethodPromise
 */
export const promisifySoapMethod = <I, O>(f: SoapMethodCB<I, O>) => (
  input: I,
  options?: Pick<soap.ISecurity, 'postProcess'>,
) =>
  new Promise<O>((resolve, reject) => {
    f(input, (err, result) => (err ? reject(err) : resolve(result)), options);
  });

/**
 * Makes sure that importoSingoloVersamento is formatted with 2 decimals
 */
export const fixImportoSingoloVersamentoDigits = (xml: string): string =>
  xml.replace(/(\d+)(\.\d+)?([\n\s]*<\/importoSingoloVersamento)/, (_, p1, p2, p3) => {
    const decimals = p2 !== undefined ? String(p2).slice(0, 3) : '.';
    const padded = decimals.padEnd(3, '0');
    return `${p1}${padded}${p3}`;
  });
