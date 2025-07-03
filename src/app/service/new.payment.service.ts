import { JwtPayload } from "jsonwebtoken";
import { accountLinks, accounts, checkout } from "../router/payment.route";
import User from "../../model/user.model";
import ApiError from "../../errors/ApiError";
import { StatusCodes } from "http-status-codes";


const createCheckOut = async (
    paylod: JwtPayload,
    data: any,
    {
        protocol,
        host
    }:{
        protocol: any,
        host: any
    }
) => {
    const { userID } = paylod;
    let session = {} as { id: string };

    const lineItems = [
        {
            price_data: {
                currency: 'usd',
                product_data: {
                    name: 'Amount',
                },
                unit_amount: data.depositAmount * 100,
            },
            quantity: 1,
        },
    ];

    const sessionData: any = {
        payment_method_types: ['card'],
        mode: 'payment',
        success_url: `${protocol}://${host}/api/v1/payment/success`,
        cancel_url: `${protocol}://${host}/api/v1/payment/cancel`,
        line_items: lineItems,
        metadata: {
        userId: String(userID),
        serviceBookingId: String(data.serviceBookingId),
        },
    };

    try {
        session = await checkout.sessions.create(sessionData);

    } catch (error) {
        console.log(error)
    }
    
    // // console.log({ session });
    const { id: session_id, url }: any = session || {};
    
    return { url };
}

const createStripeAccount = async (
  payload: JwtPayload,
  host: string,
  protocol: string,
): Promise<any> => {
    
  const existingAccount = await User.findById(payload.userID).select('user accountId isCompleted');
 
  if (existingAccount) {
    if (existingAccount.isCompleted) {
      return {
        success: false,
        message: 'Account already exists',
        data: existingAccount,
      };
    }
 
    const onboardingLink = await accountLinks.create({
      account: existingAccount.accountId,
      refresh_url: `${protocol}://${host}/api/v1/payment/refreshAccountConnect/${existingAccount.accountId}`,
      return_url: `${protocol}://${host}/api/v1/payment/success-account/${existingAccount.accountId}`,
      type: 'account_onboarding',
    });
    // console.log('onboardingLink-1', onboardingLink);
 
    return {
      success: true,
      message: 'Please complete your account',
      url: onboardingLink.url,
    };
  }
 
  const account = await accounts.create({
    type: 'express',
    email: user.email,
    country: 'US',
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
  });
  // console.log('stripe account', account);
 
  await StripeAccount.create({ accountId: account.id, userId: user.userId });
 
  const onboardingLink = await accountLinks.create({
    account: account.id,
    refresh_url: `${protocol}://${host}/api/v1/payment/refreshAccountConnect/${account.id}`,
    return_url: `${protocol}://${host}/api/v1/payment/success-account/${account.id}`,
    type: 'account_onboarding',
  });
  // console.log('onboardingLink-2', onboardingLink);
 
  return {
    success: true,
    message: 'Please complete your account',
    url: onboardingLink.url,
  };
};

const successPageAccount = catchAsync(async (req, res) => {
  // console.log('payment account hit hoise');
  const { id } = req.params;
  const account = await stripe.accounts.update(id, {});
  // console.log('account', account);
 
  if (
    account?.requirements?.disabled_reason &&
    account?.requirements?.disabled_reason.indexOf('rejected') > -1
  ) {
    return res.redirect(
      `${req.protocol + '://' + req.get('host')}/api/v1/payment/refreshAccountConnect/${id}`,
    );
  }
  if (
    account?.requirements?.disabled_reason &&
    account?.requirements?.currently_due &&
    account?.requirements?.currently_due?.length > 0
  ) {
    return res.redirect(
      `${req.protocol + '://' + req.get('host')}/api/v1/payment/refreshAccountConnect/${id}`,
    );
  }
  if (!account.payouts_enabled) {
    return res.redirect(
      `${req.protocol + '://' + req.get('host')}/api/v1/payment/refreshAccountConnect/${id}`,
    );
  }
  if (!account.charges_enabled) {
    return res.redirect(
      `${req.protocol + '://' + req.get('host')}/api/v1/payment/refreshAccountConnect/${id}`,
    );
  }
  // if (account?.requirements?.past_due) {
  //     return res.redirect(`${req.protocol + '://' + req.get('host')}/payment/refreshAccountConnect/${id}`);
  // }
  if (
    account?.requirements?.pending_verification &&
    account?.requirements?.pending_verification?.length > 0
  ) {
    // return res.redirect(`${req.protocol + '://' + req.get('host')}/payment/refreshAccountConnect/${id}`);
  }
  await StripeAccount.updateOne({ accountId: id }, { isCompleted: true });
 
  // res.render('success-account.ejs');
  res.send(successAccountTemplete)
});
 

const automaticCompletePayment = async (
    event: any
): Promise<void> => {
  console.log('hit hise webhook controller servie')
  try {
    switch (event.type) {
   
      case 'checkout.session.completed': {
        console.log('hit hise webhook controller servie checkout.session.completed');
        const session = event.data.object as Checkout.Session;
        const sessionId = session.id;
        const paymentIntentId = session.payment_intent as string;
        const serviceBookingId =
          session.metadata && (session.metadata.serviceBookingId as string);
        // console.log('=======serviceBookingId', serviceBookingId);
        const customerId =
          session.metadata && (session.metadata.userId as string);
        console.log('=======customerId', customerId);
        // session.metadata && (session.metadata.serviceBookingId as string);
        if (!paymentIntentId) {
          throw new ApiError(
            StatusCodes.BAD_REQUEST,
            'Payment Intent ID not found in session',
          );
        }
 
       
 
        break;
      }
 
      case 'checkout.session.async_payment_failed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const clientSecret = session.client_secret;
        const sessionId = session.id;
 
        if (!clientSecret) {
          console.warn('Client Secret not found in session.');
          throw new AppError(httpStatus.BAD_REQUEST, 'Client Secret not found');
        }
 
        break;
      }
 
      default:
        // // console.log(`Unhandled event type: ${event.type}`);
        // res.status(400).send();
        return;
    }
  } catch (err) {
    console.error('Error processing webhook event:', err);
    // res.status(500).send('Internal Server Error');
  }
};