import { CONFIG, Configuration } from '../config';
import { getPaActivate, IECConfig } from '../fixtures/fixActivateResponse';
import { paActivate27, paActivatePagamentoDuplicatoV2 } from '../fixtures/fixActivateV2Response';
import { paVerify00 } from '../fixtures/fixVerifyResponse';
import { paErrorPaymentUnknown } from '../fixtures/nodoNewMod3Responses';
import { handlePaGetPayment } from './paGetPayment.handler';
import { handlePaVerifyPaymentNotice } from './paVerifyPaymentNotice.handler';

const fiscalCode = 'RSSMRA80A01H501U';

const createResponse = () => ({
  status: jest.fn().mockReturnThis(),
  send: jest.fn(),
});

const createEc = (): IECConfig => ({
  email: 'ec@example.test',
  fullName: 'Test EC',
  CF: 'DEBTORCF',
  orgFiscalCode: fiscalCode,
  CCPostPrimaryEC: 'IT57N0760114800000011050036',
  CCBankPrimaryEC: 'IT30N0103076271000001823603',
  CCPostSecondaryEC: 'IT03E0760101600000000003236',
  CCBankSecondaryEC: 'IT15V0306901783100000300001',
  CCBankThirdEC: 'IT80E0306904013100000046039',
});

it('injects orgFiscalCode through IECConfig in paGetPayment fixture builders', () => {
  const ec = createEc();
  const request = {
    creditorReferenceId: undefined,
    'soapenv:Envelope': {
      'soapenv:Body': [
        {
          'pafn:pagetpaymentreq': [
            {
              qrcode: [{ noticenumber: ['3000000000000'] }],
            },
          ],
        },
      ],
    },
  };
  const [, xml] = getPaActivate('00', ec)(request);

  expect(xml).toContain(`<fiscalCodePA>${fiscalCode}</fiscalCodePA>`);
  expect(xml).not.toContain('77777777777');
});

it('injects orgFiscalCode in paGetPaymentV2 special fixture responses', () => {
  const [, xml] = paActivate27({ creditorReferenceId: 'ref', ec: createEc() });

  expect(xml).toContain(`<fiscalCodePA>${fiscalCode}</fiscalCodePA>`);
  expect(xml).not.toContain('77777777777');
});

it('injects orgFiscalCode in paGetPaymentV2 duplicate fault responses', () => {
  const [, xml] = paActivatePagamentoDuplicatoV2({ ec: createEc() });

  expect(xml).toContain(`<id>${fiscalCode}</id>`);
  expect(xml).not.toContain('77777777777');
});

it('builds paVerify fixture XML with the supplied orgFiscalCode', () => {
  expect(paVerify00.xml(fiscalCode)).toContain(`<fiscalCodePA>${fiscalCode}</fiscalCodePA>`);
});

it('builds shared fault responses with the supplied orgFiscalCode', () => {
  const params: Parameters<typeof paErrorPaymentUnknown>[0] = {
    typeR: 'paVerifyPaymentNoticeRes',
    orgFiscalCode: fiscalCode,
  };
  const [, xml] = paErrorPaymentUnknown(params);

  expect(xml).toContain(`<id>${fiscalCode}</id>`);
});

it('uses the request fiscal code in paVerifyPaymentNotice fixture responses', async () => {
  const res = createResponse();

  await handlePaVerifyPaymentNotice(
    CONFIG as Configuration,
    [],
    { qrcode: [{ fiscalcode: fiscalCode, noticenumber: '3000000000000' }] },
    {},
    res,
    new Map(),
    new Map(),
    new Map(),
    new Map(),
  );

  const xml = res.send.mock.calls[0][0];
  expect(xml).toContain(`<fiscalCodePA>${fiscalCode}</fiscalCodePA>`);
  expect(xml).not.toContain('77777777777');
});

it('uses the request fiscal code in paVerifyPaymentNotice fault responses', async () => {
  const res = createResponse();

  await handlePaVerifyPaymentNotice(
    CONFIG as Configuration,
    [],
    { qrcode: [{ fiscalcode: fiscalCode, noticenumber: '3119900000000' }] },
    {},
    res,
    new Map(),
    new Map(),
    new Map(),
    new Map(),
  );

  const xml = res.send.mock.calls[0][0];
  expect(xml).toContain(`<id>${fiscalCode}</id>`);
  expect(xml).not.toContain('77777777777');
});

it('uses the request fiscal code in paGetPayment fixture responses', async () => {
  const res = createResponse();
  const noticeNumber = '3000000000000';

  await handlePaGetPayment(
    CONFIG as Configuration,
    [],
    { qrcode: [{ fiscalcode: fiscalCode, noticenumber: [noticeNumber] }] },
    {
      body: {
        'soapenv:Envelope': {
          'soapenv:Body': [
            {
              'pafn:pagetpaymentreq': [
                {
                  qrcode: [{ noticenumber: [noticeNumber] }],
                },
              ],
            },
          ],
        },
      },
    },
    res,
    new Map(),
    new Map(),
    new Map(),
    new Map(),
  );

  const xml = res.send.mock.calls[0][0];
  expect(xml).toContain(`<fiscalCodePA>${fiscalCode}</fiscalCodePA>`);
  expect(xml).not.toContain('77777777777');
});

it('uses the request fiscal code in paGetPayment fault responses', async () => {
  const res = createResponse();

  await handlePaGetPayment(
    CONFIG as Configuration,
    [],
    { qrcode: [{ fiscalcode: fiscalCode, noticenumber: ['invalid'] }] },
    { body: {} },
    res,
    new Map(),
    new Map(),
    new Map(),
    new Map(),
  );

  const xml = res.send.mock.calls[0][0];
  expect(xml).toContain(`<id>${fiscalCode}</id>`);
  expect(xml).not.toContain('77777777777');
});
