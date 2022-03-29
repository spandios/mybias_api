import { Router } from 'express';
import TokenChecker from '../middlewares/TokenChecker';
import SupportService from '../service/SupportService';
import CommonService from '../service/CommonService';
import Support, { Payer, Paypal } from '../entity/support/Support';
import { getRepository } from 'typeorm';
import Campaign, { CampaignStatus } from '../entity/campaign/Campaign';
import paypal from '@paypal/checkout-server-sdk';
import { User } from '../entity/user/User';
import { toNumber } from '../util/util';
import { BadRequestException } from '../error/Error';
const router = Router();
import { payPalHttpClient } from '../app';

router.get('/', TokenChecker, (req, res, next) => {
  const { userId } = req;
  SupportService.supportListByUser(userId)
    .then((r) => res.send(r))
    .catch(next);
});

router.get('/is_success_fund', TokenChecker, async (req, res, next) => {
  const { camId } = req.query;
  if (!camId) return res.sendStatus(400);
  const campaign = await getRepository(Campaign).findOne(Number(camId));
  if (campaign.accAmountCnt < campaign.amountCnt) {
    return res.sendStatus(200);
  } else {
    return res.sendStatus(400);
  }
});

const validateId = (orderId: string, campaignId: string) => {
  if (!orderId) {
    throw new BadRequestException('EMPTY ORDER ID ');
  }

  if (!campaignId) {
    throw new BadRequestException('Empty CAMPAIGN ID');
  }
};

const validateAmount = (amount: number, cnt: number, campaign: Campaign) => {
  if (amount < 1 || amount !== campaign.amountUnit * cnt) {
    return new BadRequestException('INVALID AMOUNT');
  }

  if (campaign.accAmountCnt + cnt > campaign.amountCnt) {
    return new BadRequestException('모금수량 초과입니다.');
  }
  if (campaign.accAmountCnt == campaign.amountCnt) {
    return new BadRequestException('모금이 끝났습니다.');
  }
};
router.post('/', TokenChecker, async (req, res, next) => {
  try {
    const { userId } = req;
    const { orderId, amount: tAmount, campaignId, cnt: tCnt } = req.body;
    const amount = toNumber(tAmount);
    const cnt = toNumber(tCnt);
    if (cnt < 1) {
      return new BadRequestException('INVALID CNT');
    }
    validateId(orderId, campaignId);
    const user = await CommonService.findById(User, userId);
    const campaign = await CommonService.findById(Campaign, campaignId);
    validateAmount(amount, cnt, campaign);
    const support = await SupportService.prepareSupport(orderId, user, campaign, amount, cnt);
    const captureResponse = await captureOrder(orderId);
    const finalPaypal = toFinalPaypal(captureResponse, support.paypal);
    const completeSupport = await SupportService.completeSupport(
      user,
      campaign,
      support,
      finalPaypal,
    );
    res.send(completeSupport);
  } catch (e) {
    next(e);
  }
});

router.get('/list', async (req, res, next) => {
  try {
    const type = req.query.type;
    if (type === 'campaign') {
      const campaignId = Number(req.query.campaignId);
      const cnt = await SupportService.supporterCntByCampaign(campaignId);
      const supporterList = await SupportService.supporterListByCampaign(campaignId);
      return res.send({ cnt, supporterList });
    } else if (type === 'ranking') {
      const r = await SupportService.rankingSupportListByCampaign();
      return res.send(r);
    }
  } catch (e) {
    next(e);
  }
});

router.get('/:id', TokenChecker, async (req, res, next) => {
  try {
    const id = CommonService.getParamsId(req);
    const support = await CommonService.findById(Support, id, ['user', 'campaign']);
    res.send(support);
  } catch (e) {
    next(e);
  }
});

router.post('/refund', async (req, res, next) => {
  const request = new paypal.payments.CapturesRefundRequest('0NM27908RC170033V');
  request.requestBody({
    amount: {
      currency_code: 'USD',
      value: '5.00',
    },
  });
  try {
    const refund = await payPalHttpClient.execute(request);
    console.log(refund);
    return res.send({ refundID: refund.id });
  } catch (err) {
    // 4. Handle any errors from the call
    console.error(err);
  }
  // 5. Return a successful response to the client with the order ID

  // // 1a. Add your client ID and secret
  // const PAYPAL_CLIENT =
  //   'AXF9vwigjQCTjiaVeNBFlSWgGqTGx2qKIo9Svizckdx3KmHM3BABGBWu-QGr6KlDtBn7d3zwdEmuyPtb';
  // const PAYPAL_SECRET =
  //   'EMIZx9TO_-iS0aQ1CN5cGV0p3gOABddVngrxg3Ik3CkDFiiBoEF_KRxCfXkhh-V--1g2QgA3RJtRMlpf';
  //
  // // 1b. Point your server to the PayPal API
  //
  // // 1c. Get an access token from the PayPal API
  // const basicAuth = Buffer.from(`${PAYPAL_CLIENT}:${PAYPAL_SECRET}`).toString('base64');
  // const optionForAccessToken = {
  //   url: PAYPAL_OAUTH_API,
  //   headers: {
  //     Accept: `application/json`,
  //     Authorization: `Basic ${basicAuth}`,
  //   },
  //   body: `grant_type=client_credentials`,
  // };
  //
  // request.post(optionForAccessToken, (error, response, body) => {
  //   if (error) {
  //     console.log(error);
  //   } else {
  //     const { access_token } = JSON.parse(body);
  //     const optionForRefund = {
  //       url: PAYPAL_PAYMENTS_API + '5S972524A9260304U' + '/refund ',
  //       headers: {
  //         Accept: `application/json`,
  //         Authorization: `Bearer ${access_token}`,
  //         body: JSON.stringify({
  //           amount: {
  //             currency_code: 'USD',
  //             value: '5.00',
  //           },
  //         }),
  //       },
  //     };
  //     request.post(optionForRefund, (err, refundRes, body) => {
  //       if (err) {
  //         console.log(err);
  //       } else {
  //         if (body.error) {
  //           res.status(500).send(body);
  //         }
  //         console.log(refundRes);
  //         console.log(body);
  //         res.send(body);
  //       }
  //     });
  //   }
});

const captureOrder = async function (orderId) {
  const request = new paypal.orders.OrdersCaptureRequest(orderId);
  request.requestBody({});
  const response = await payPalHttpClient.execute(request);
  console.log(response);
  return response;
};

function toFinalPaypal(response, paypal: Paypal): Paypal {
  console.log('client pay amonut');
  console.log(paypal.amount);
  console.log('real pay amonut');
  console.log(Number(response.result.purchase_units[0].payments.captures[0].amount.value));

  if (
    paypal.amount == Number(response.result.purchase_units[0].payments.captures[0].amount.value)
  ) {
    paypal.amount = response.result.purchase_units[0].payments.captures[0].amount.value;
  } else {
    throw new BadRequestException('MISMATCH AMOUNT');
  }
  paypal.captureId = response.result.purchase_units[0].payments.captures[0].id;
  paypal.intent = 'CAPTURE';
  paypal.status = response.result.status;
  paypal.payComplete = true;
  const payer = new Payer();
  payer.email = response.result.payer.email_address;
  payer.countryCode = response.result.payer.address.country_code;
  payer.id = response.result.payer.payer_id;
  payer.name = response.result.payer.name.given_name + ' ' + response.result.payer.name.surname;
  paypal.payer = payer;
  return paypal;
}

export default router;
