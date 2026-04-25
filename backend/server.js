const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({
    verify: (req, _res, buf) => {
        req.rawBody = buf;
    },
}));

// mongoose connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kodequantum', {
}).then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

    // schema
    const ContactSchema = new mongoose.Schema({
        name: String,
        email: String,
        message: String,
    });

    const Contact = mongoose.model('Contact', ContactSchema);

    // Service schema and model
    const ServiceSchema = new mongoose.Schema({
        provider_id: { type: String, required: true },
        category_id: { type: String, required: true },
        title: { type: String, required: true },
        description: { type: String, default: '' },
        price: { type: Number, default: 0 },
        price_type: { type: String, default: 'fixed' },
        experience_years: { type: Number, default: 0 },
        location: { type: String, default: '' },
        is_active: { type: Boolean, default: true },
        created_at: { type: Date, default: Date.now },
    }, { timestamps: true });

    const Service = mongoose.model('Service', ServiceSchema);

    // Service Request schema and model
    const ServiceRequestSchema = new mongoose.Schema({
        uuid: { type: String, required: true, unique: true, default: uuidv4 },
        taker_id: { type: String, required: true },
        provider_id: { type: String, required: true },
        service_id: { type: String, required: true },
        description: { type: String, required: true },
        address: { type: String, default: '' },
        preferred_date: { type: String, default: null },
        preferred_time: { type: String, default: null },
        status: { type: String, default: 'pending' },
        payment_method: { type: String, enum: ['online', 'cod'], default: 'online' },
        service_price: { type: Number, default: 0 },
        platform_fee: { type: Number, default: 0 },
        tax_amount: { type: Number, default: 0 },
        total_amount: { type: Number, default: 0 },
        provider_payout_amount: { type: Number, default: 0 },
        payment_status: { type: String, default: 'awaiting_payment' }, // awaiting_payment | paid | cod_pending | cod_collected
        escrow_status: { type: String, default: 'not_applicable' }, // held | released | refunded | not_applicable
        payout_status: { type: String, default: 'not_released' }, // not_released | released
        completion_confirmed_by_taker: { type: Boolean, default: false },
        completed_at: { type: Date, default: null },
        confirmed_at: { type: Date, default: null },
        cod_collected_at: { type: Date, default: null },
        invoice_number: { type: String, required: true, default: () => `INV-${Date.now()}-${Math.floor(Math.random() * 10000)}` },
        razorpay_order_id: { type: String, default: '' },
        razorpay_payment_id: { type: String, default: '' },
        razorpay_signature: { type: String, default: '' },
        payment_received_at: { type: Date, default: null },
        created_at: { type: Date, default: Date.now },
    }, { timestamps: true });

    const ServiceRequest = mongoose.model('ServiceRequest', ServiceRequestSchema);

    const PaymentTransactionSchema = new mongoose.Schema({
        request_uuid: { type: String, default: '' },
        taker_id: { type: String, required: true },
        service_id: { type: String, required: true },
        provider_id: { type: String, required: true },
        payment_method: { type: String, enum: ['online', 'cod'], required: true },
        amount: { type: Number, required: true },
        currency: { type: String, default: 'INR' },
        status: { type: String, default: 'created' }, // created | verified | failed | refunded
        razorpay_order_id: { type: String, default: '' },
        razorpay_payment_id: { type: String, default: '' },
        razorpay_signature: { type: String, default: '' },
        gateway_payload: { type: Object, default: {} },
    }, { timestamps: true });

    const PaymentTransaction = mongoose.model('PaymentTransaction', PaymentTransactionSchema);

    const SubscriptionSchema = new mongoose.Schema({
        uuid: { type: String, required: true, unique: true, default: uuidv4 },
        provider_id: { type: String, required: true },
        plan_name: { type: String, required: true, default: 'Free' },
        price: { type: Number, required: true, default: 0 },
        billing_interval: { type: String, enum: ['monthly', 'yearly'], default: 'monthly' },
        status: { type: String, enum: ['free', 'active', 'past_due', 'cancelled', 'paused'], default: 'free' },
        razorpay_subscription_id: { type: String, default: '' },
        start_date: { type: Date, default: Date.now },
        renewal_date: { type: Date, default: Date.now },
        auto_renew: { type: Boolean, default: true },
        leads_limit: { type: Number, default: 5 },
        leads_used: { type: Number, default: 0 },
        verified_badge: { type: Boolean, default: false },
        featured_listing: { type: Boolean, default: false },
        created_at: { type: Date, default: Date.now },
    }, { timestamps: true });

    const Subscription = mongoose.model('Subscription', SubscriptionSchema);

    const BillingHistorySchema = new mongoose.Schema({
        provider_id: { type: String, required: true },
        plan_name: { type: String, required: true },
        amount: { type: Number, required: true },
        payment_id: { type: String, default: '' },
        invoice_url: { type: String, default: '' },
        status: { type: String, default: 'paid' },
        paid_at: { type: Date, default: Date.now },
        razorpay_subscription_id: { type: String, default: '' },
    }, { timestamps: true });

    const BillingHistory = mongoose.model('BillingHistory', BillingHistorySchema);

    const TAX_RATE = 0.18;
    const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';
    const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || '';

    const razorpay = (RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET)
        ? new Razorpay({
            key_id: RAZORPAY_KEY_ID,
            key_secret: RAZORPAY_KEY_SECRET,
        })
        : null;

    const SUBSCRIPTION_PLANS = {
        free: {
            plan_name: 'Free',
            price: 0,
            leads_limit: 5,
            verified_badge: false,
            featured_listing: false,
            rank: 1,
            features: [
                'Basic profile listing',
                '5 monthly leads',
                'Standard support',
                'Low search ranking',
            ],
        },
        starter: {
            plan_name: 'Starter',
            price: 499,
            leads_limit: 20,
            verified_badge: false,
            featured_listing: false,
            rank: 2,
            features: [
                '20 monthly leads',
                'Better search ranking',
                'Basic analytics',
                'Faster support',
            ],
        },
        pro: {
            plan_name: 'Pro',
            price: 999,
            leads_limit: 50,
            verified_badge: true,
            featured_listing: false,
            rank: 3,
            features: [
                '50 monthly leads',
                'Verified badge',
                'Priority search ranking',
                'Advanced analytics',
                'Booking insights',
                'Priority support',
            ],
        },
        premium: {
            plan_name: 'Premium',
            price: 2499,
            leads_limit: null,
            verified_badge: true,
            featured_listing: true,
            rank: 4,
            features: [
                'Unlimited leads',
                'Homepage featured placement',
                'Top ranking',
                'AI auto-reply assistant',
                'Customer CRM tools',
                'Premium badge',
                'Dedicated support',
            ],
        },
    };

    const planCache = {};

    const getPlanConfig = (planName) => {
        const key = String(planName || 'Free').trim().toLowerCase();
        return SUBSCRIPTION_PLANS[key] || SUBSCRIPTION_PLANS.free;
    };

    const getBillingAmount = (planKey, interval) => {
        const plan = SUBSCRIPTION_PLANS[planKey] || SUBSCRIPTION_PLANS.free;
        if (interval === 'yearly') {
            return Math.round(plan.price * 12 * 0.8);
        }
        return plan.price;
    };

    const ensureRazorpayPlan = async (planKey, amount, interval) => {
        if (!razorpay) return null;
        const cacheKey = `${planKey}_${interval}`;
        if (planCache[cacheKey]) return planCache[cacheKey];

        const envPlanKey = `RAZORPAY_PLAN_${planKey.toUpperCase()}_${interval.toUpperCase()}`;
        const envPlanId = process.env[envPlanKey];
        if (envPlanId) {
            planCache[cacheKey] = envPlanId;
            return envPlanId;
        }

        const productName = `Servixen ${SUBSCRIPTION_PLANS[planKey].plan_name} ${interval}`;
        const product = await razorpay.products.create({
            name: productName,
            description: `${SUBSCRIPTION_PLANS[planKey].plan_name} subscription for providers`,
            type: 'service',
        });

        const plan = await razorpay.plans.create({
            period: interval,
            interval: 1,
            item: {
                name: productName,
                amount: amount * 100,
                currency: 'INR',
                description: `${SUBSCRIPTION_PLANS[planKey].plan_name} recurring subscription`,
            },
            product: product.id,
        });

        planCache[cacheKey] = plan.id;
        return plan.id;
    };

    const createRazorpaySubscription = async (planKey, interval) => {
        const amount = getBillingAmount(planKey, interval);
        const planId = await ensureRazorpayPlan(planKey, amount, interval);
        if (!planId) return null;

        const subscription = await razorpay.subscriptions.create({
            plan_id: planId,
            customer_notify: 1,
            total_count: 999,
            quantity: 1,
            start_at: Math.floor(Date.now() / 1000) + 60,
        });
        return subscription;
    };

    const verifySubscriptionSignature = ({ subscriptionId, paymentId, signature }) => {
        if (!razorpay) return false;
        try {
            return razorpay.utils.verifyPaymentSignature({
                razorpay_payment_id: paymentId,
                razorpay_subscription_id: subscriptionId,
                razorpay_signature: signature,
            });
        } catch (err) {
            return false;
        }
    };

    const makeRenewalDate = (interval) => {
        const date = new Date();
        if (interval === 'yearly') {
            date.setFullYear(date.getFullYear() + 1);
        } else {
            date.setMonth(date.getMonth() + 1);
        }
        return date;
    };

    const normalizePlanKey = (planName) => String(planName || 'Free').trim().toLowerCase();

    const buildSubscriptionSummary = async (providerId) => {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const planSub = await Subscription.findOne({ provider_id: providerId });
        const requests = await ServiceRequest.find({ provider_id: providerId, created_at: { $gte: monthStart } });
        const completedBookings = requests.filter(r => ['accepted', 'completed'].includes(r.status)).length;
        const revenue = requests.reduce((sum, req) => sum + (Number(req.provider_payout_amount) || 0), 0);
        return {
            bookings_this_month: completedBookings,
            profile_views: 120 + completedBookings * 15,
            search_impressions: 350 + completedBookings * 20,
            conversion_rate: completedBookings > 0 ? Math.min(100, Math.round((completedBookings / Math.max(1, requests.length)) * 100)) : 0,
            revenue_generated: revenue,
            leads_used: planSub?.leads_used || 0,
            leads_limit: planSub?.leads_limit ?? SUBSCRIPTION_PLANS.free.leads_limit,
            plan_name: planSub?.plan_name || SUBSCRIPTION_PLANS.free.plan_name,
            renewal_date: planSub?.renewal_date || makeRenewalDate('monthly'),
            status: planSub?.status || 'free',
            price: planSub?.price || 0,
            billing_interval: planSub?.billing_interval || 'monthly',
            verified_badge: planSub?.verified_badge || false,
            featured_listing: planSub?.featured_listing || false,
            auto_renew: planSub?.auto_renew ?? false,
        };
    };

    const ensureSubscriptionDocument = async (providerId) => {
        let sub = await Subscription.findOne({ provider_id: providerId });
        if (!sub) {
            const freeConfig = SUBSCRIPTION_PLANS.free;
            sub = await Subscription.create({
                provider_id: providerId,
                plan_name: freeConfig.plan_name,
                price: freeConfig.price,
                billing_interval: 'monthly',
                status: 'free',
                auto_renew: false,
                leads_limit: freeConfig.leads_limit,
                leads_used: 0,
                verified_badge: freeConfig.verified_badge,
                featured_listing: freeConfig.featured_listing,
                renewal_date: makeRenewalDate('monthly'),
            });
        }
        return sub;
    };

    const downgradeProviderToFree = async (providerId) => {
        const freeConfig = SUBSCRIPTION_PLANS.free;
        const updated = await Subscription.findOneAndUpdate(
            { provider_id: providerId },
            {
                plan_name: freeConfig.plan_name,
                price: freeConfig.price,
                billing_interval: 'monthly',
                status: 'free',
                razorpay_subscription_id: '',
                auto_renew: false,
                leads_limit: freeConfig.leads_limit,
                leads_used: 0,
                verified_badge: freeConfig.verified_badge,
                featured_listing: freeConfig.featured_listing,
                renewal_date: makeRenewalDate('monthly'),
            },
            { new: true, upsert: true }
        );
        return updated;
    };

    const ensureActiveSubscription = async (providerId) => {
        const sub = await ensureSubscriptionDocument(providerId);
        if (sub.status !== 'free' && sub.renewal_date && new Date(sub.renewal_date) < new Date() && !sub.auto_renew) {
            await downgradeProviderToFree(providerId);
            return await ensureSubscriptionDocument(providerId);
        }
        return sub;
    };

    const createOrUpdateSubscriptionDoc = async ({ providerId, planKey, interval, razorpaySubscriptionId, status = 'active' }) => {
        const config = getPlanConfig(planKey);
        const price = getBillingAmount(planKey, interval);
        return Subscription.findOneAndUpdate(
            { provider_id: providerId },
            {
                provider_id: providerId,
                plan_name: config.plan_name,
                price,
                billing_interval: interval,
                status,
                razorpay_subscription_id: razorpaySubscriptionId || '',
                start_date: new Date(),
                renewal_date: makeRenewalDate(interval),
                auto_renew: status === 'active',
                leads_limit: config.leads_limit === null ? null : config.leads_limit,
                leads_used: 0,
                verified_badge: config.verified_badge,
                featured_listing: config.featured_listing,
            },
            { new: true, upsert: true }
        );
    };

    const withRequestId = (r) => ({ ...r.toObject(), id: r.uuid });

    const calcPaymentBreakdown = (servicePrice) => {
        const service_price = Number(servicePrice) || 0;
        const platform_fee = Math.round(service_price * PLATFORM_FEE_RATE);
        const tax_amount = Math.round(platform_fee * TAX_RATE);
        const total_amount = service_price + platform_fee + tax_amount;
        const provider_payout_amount = service_price;
        return {
            service_price,
            platform_fee,
            tax_amount,
            total_amount,
            provider_payout_amount,
        };
    };

    const verifyRazorpaySignature = ({ orderId, paymentId, signature }) => {
        if (!RAZORPAY_KEY_SECRET) return false;
        const expected = crypto
            .createHmac('sha256', RAZORPAY_KEY_SECRET)
            .update(`${orderId}|${paymentId}`)
            .digest('hex');
        return expected === signature;
    };

    const applyAutomationRules = async () => {
        const now = Date.now();
        const autoReleaseThreshold = new Date(now - (24 * 60 * 60 * 1000));

        await ServiceRequest.updateMany(
            {
                payment_method: 'online',
                status: 'completed',
                payment_status: 'paid',
                escrow_status: 'held',
                completion_confirmed_by_taker: false,
                completed_at: { $lte: autoReleaseThreshold },
            },
            {
                $set: {
                    escrow_status: 'released',
                    payout_status: 'released',
                },
            }
        );

    };

    const buildProviderWallet = async (providerId) => {
        const rows = await ServiceRequest.find({ provider_id: providerId });
        return rows.reduce((acc, row) => {
            const amount = Number(row.provider_payout_amount) || 0;
            if (row.payment_method === 'online') {
                if (row.escrow_status === 'held') acc.pending_escrow += amount;
                if (row.payout_status === 'released') acc.available_balance += amount;
            }
            if (row.payment_method === 'cod' && row.payment_status === 'cod_collected') {
                acc.cod_collected += Number(row.service_price) || 0;
            }
            return acc;
        }, {
            available_balance: 0,
            pending_escrow: 0,
            cod_collected: 0,
        });
    };

    // routes
    app.post('/api/contact', async (req, res) => {
        try {
            const newContact = new Contact(req.body);
            await newContact.save();
            res.status(201).json({ message: 'Contact saved successfully' });
        }
        catch (err) {
            res.status(500).json({ message: 'Error saving contact', error: err });
        }
    });

    // services endpoints
    app.get('/api/services', async (req, res) => {
        try {
            const filter = { is_active: true };
            if (req.query.provider_id) filter.provider_id = req.query.provider_id;
            if (req.query.category_id) filter.category_id = req.query.category_id;

            let services = await Service.find(filter).sort({ created_at: -1 });

            // Filter by location if specified
            if (req.query.location && req.query.location.trim()) {
                const locationQuery = req.query.location.trim().toLowerCase();
                services = services.filter(s => s.location && s.location.toLowerCase().includes(locationQuery));
            }

            const providerIds = [...new Set(services.map((s) => s.provider_id))];
            const subscriptions = await Subscription.find({ provider_id: { $in: providerIds } });
            const subscriptionMap = new Map(subscriptions.map((sub) => [sub.provider_id, sub]));
            const mapped = services.map((service) => {
                const sub = subscriptionMap.get(service.provider_id);
                const planKey = normalizePlanKey(sub?.plan_name || 'Free');
                const ranking = getPlanConfig(planKey).rank;
                return {
                    ...service.toObject(),
                    provider_plan: sub?.plan_name || 'Free',
                    plan_rank: ranking,
                };
            });
            mapped.sort((a, b) => (b.plan_rank || 0) - (a.plan_rank || 0));
            res.json(mapped);
        } catch (err) {
            res.status(500).json({ message: 'Error fetching services', error: err });
        }
    });

    app.post('/api/payments/create-order', async (req, res) => {
        try {
            if (!razorpay) {
                return res.status(500).json({ message: 'Payment gateway is not configured on server' });
            }

            const { service_id, taker_id } = req.body;
            const service = await Service.findById(service_id);
            if (!service) {
                return res.status(404).json({ message: 'Service not found' });
            }

            const amounts = calcPaymentBreakdown(service.price);
            const amountInPaise = amounts.total_amount * 100;

            const order = await razorpay.orders.create({
                amount: amountInPaise,
                currency: 'INR',
                receipt: `svc_${Date.now()}`,
                notes: {
                    service_id: String(service_id),
                    taker_id: String(taker_id || ''),
                    provider_id: String(service.provider_id),
                },
            });

            await PaymentTransaction.create({
                taker_id: String(taker_id || ''),
                service_id: String(service_id),
                provider_id: String(service.provider_id),
                payment_method: 'online',
                amount: amounts.total_amount,
                currency: 'INR',
                status: 'created',
                razorpay_order_id: order.id,
                gateway_payload: order,
            });

            res.json({
                key: RAZORPAY_KEY_ID,
                order_id: order.id,
                currency: order.currency,
                amount: order.amount,
                breakdown: amounts,
            });
        } catch (err) {
            res.status(500).json({ message: 'Failed to create payment order', error: err.message || err });
        }
    });

    app.post('/api/payments/verify', async (req, res) => {
        try {
            const {
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature,
                service_id,
                taker_id,
                provider_id,
                amount,
            } = req.body;

            const ok = verifyRazorpaySignature({
                orderId: razorpay_order_id,
                paymentId: razorpay_payment_id,
                signature: razorpay_signature,
            });

            if (!ok) {
                return res.status(400).json({ message: 'Payment signature verification failed' });
            }

            await PaymentTransaction.findOneAndUpdate(
                { razorpay_order_id },
                {
                    $set: {
                        status: 'verified',
                        razorpay_payment_id,
                        razorpay_signature,
                        gateway_payload: req.body,
                    },
                },
                { upsert: true, new: true }
            );

            res.json({
                verified: true,
                payment: {
                    razorpay_order_id,
                    razorpay_payment_id,
                    razorpay_signature,
                },
                booking_payload: {
                    service_id,
                    taker_id,
                    provider_id,
                    amount,
                },
            });
        } catch (err) {
            res.status(500).json({ message: 'Payment verification failed', error: err.message || err });
        }
    });

    app.post('/api/payments/webhook', async (req, res) => {
        try {
            if (!RAZORPAY_WEBHOOK_SECRET) {
                return res.status(200).json({ received: true });
            }
            if (!req.rawBody) {
                return res.status(400).json({ message: 'Missing raw payload for webhook verification' });
            }
            const signature = req.headers['x-razorpay-signature'];
            const expected = crypto
                .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
                .update(req.rawBody)
                .digest('hex');
            if (signature !== expected) {
                return res.status(400).json({ message: 'Invalid webhook signature' });
            }

            const event = JSON.parse(req.rawBody.toString());
            const paymentEntity = event?.payload?.payment?.entity;
            const orderId = paymentEntity?.order_id;
            const paymentId = paymentEntity?.id;
            if (orderId && paymentId) {
                await PaymentTransaction.findOneAndUpdate(
                    { razorpay_order_id: orderId },
                    {
                        $set: {
                            razorpay_payment_id: paymentId,
                            status: event.event === 'payment.captured' ? 'verified' : 'created',
                            gateway_payload: event,
                        },
                    }
                );
            }

            res.json({ received: true });
        } catch (err) {
            res.status(500).json({ message: 'Webhook processing failed', error: err.message || err });
        }
    });

    app.get('/api/subscriptions/:providerId', async (req, res) => {
        try {
            const providerId = req.params.providerId;
            const subscription = await ensureActiveSubscription(providerId);
            const summary = await buildSubscriptionSummary(providerId);
            res.json({ subscription, summary });
        } catch (err) {
            res.status(500).json({ message: 'Error fetching subscription', error: err.message || err });
        }
    });

    app.post('/api/subscriptions/create', async (req, res) => {
        try {
            const { provider_id, plan_name, billing_interval = 'monthly', customer_email = '', customer_contact = '' } = req.body;
            if (!provider_id || !plan_name) {
                return res.status(400).json({ message: 'Provider and plan are required' });
            }
            const planKey = normalizePlanKey(plan_name);
            if (planKey === 'free') {
                const subscription = await createOrUpdateSubscriptionDoc({ providerId: provider_id, planKey, interval: billing_interval, status: 'free' });
                return res.json({ subscription, payment: null });
            }
            if (!razorpay) {
                return res.status(500).json({ message: 'Razorpay is not configured' });
            }
            const subscription = await createRazorpaySubscription(planKey, billing_interval);
            const local = await createOrUpdateSubscriptionDoc({ providerId: provider_id, planKey, interval: billing_interval, razorpaySubscriptionId: subscription.id, status: 'pending' });
            res.json({ subscription_id: subscription.id, razorpay_short_url: subscription.short_url || '', razorpay_key_id: RAZORPAY_KEY_ID, subscription: local });
        } catch (err) {
            res.status(500).json({ message: 'Error creating subscription', error: err.message || err });
        }
    });

    app.post('/api/subscriptions/confirm', async (req, res) => {
        try {
            const { provider_id, plan_name, billing_interval = 'monthly', razorpay_subscription_id, razorpay_payment_id, razorpay_signature } = req.body;
            if (!provider_id || !plan_name || !razorpay_subscription_id || !razorpay_payment_id || !razorpay_signature) {
                return res.status(400).json({ message: 'Missing confirmation payload' });
            }
            if (!verifySubscriptionSignature({ subscriptionId: razorpay_subscription_id, paymentId: razorpay_payment_id, signature: razorpay_signature })) {
                return res.status(400).json({ message: 'Subscription signature verification failed' });
            }
            const razorpaySubscription = razorpay
                ? await razorpay.subscriptions.fetch(razorpay_subscription_id)
                : null;
            const planKey = normalizePlanKey(plan_name);
            const local = await createOrUpdateSubscriptionDoc({ providerId: provider_id, planKey, interval: billing_interval, razorpaySubscriptionId: razorpay_subscription_id, status: 'active' });
            await BillingHistory.create({
                provider_id,
                plan_name: local.plan_name,
                amount: local.price,
                payment_id: razorpay_payment_id,
                invoice_url: razorpaySubscription?.short_url || '',
                status: 'paid',
                paid_at: new Date(),
                razorpay_subscription_id,
            });
            res.json({ subscription: local, razorpay: razorpaySubscription || null });
        } catch (err) {
            res.status(500).json({ message: 'Error confirming subscription', error: err.message || err });
        }
    });

    app.put('/api/subscriptions/:providerId/cancel', async (req, res) => {
        try {
            const providerId = req.params.providerId;
            const subscription = await Subscription.findOne({ provider_id: providerId });
            if (!subscription) return res.status(404).json({ message: 'Subscription not found' });
            if (subscription.razorpay_subscription_id && razorpay) {
                await razorpay.subscriptions.cancel(subscription.razorpay_subscription_id, { cancel_at_cycle_end: true });
            }
            subscription.status = 'cancelled';
            subscription.auto_renew = false;
            await subscription.save();
            res.json(subscription);
        } catch (err) {
            res.status(500).json({ message: 'Error cancelling subscription', error: err.message || err });
        }
    });

    app.post('/api/subscriptions/:providerId/pause', async (req, res) => {
        try {
            const providerId = req.params.providerId;
            const subscription = await Subscription.findOne({ provider_id: providerId });
            if (!subscription) return res.status(404).json({ message: 'Subscription not found' });
            if (subscription.razorpay_subscription_id && razorpay) {
                await razorpay.subscriptions.pause(subscription.razorpay_subscription_id);
            }
            subscription.status = 'paused';
            subscription.auto_renew = false;
            await subscription.save();
            res.json(subscription);
        } catch (err) {
            res.status(500).json({ message: 'Error pausing subscription', error: err.message || err });
        }
    });

    app.post('/api/subscriptions/:providerId/retry', async (req, res) => {
        try {
            const providerId = req.params.providerId;
            const subscription = await Subscription.findOne({ provider_id: providerId });
            if (!subscription) return res.status(404).json({ message: 'Subscription not found' });
            subscription.status = 'active';
            subscription.auto_renew = true;
            await subscription.save();
            res.json(subscription);
        } catch (err) {
            res.status(500).json({ message: 'Error retrying subscription', error: err.message || err });
        }
    });

    app.get('/api/billing-history', async (req, res) => {
        try {
            const filter = {};
            if (req.query.provider_id) filter.provider_id = req.query.provider_id;
            const history = await BillingHistory.find(filter).sort({ paid_at: -1 });
            res.json(history);
        } catch (err) {
            res.status(500).json({ message: 'Error fetching billing history', error: err.message || err });
        }
    });

    app.get('/api/services/:id', async (req, res) => {
        try {
            const service = await Service.findById(req.params.id);
            if (!service) return res.status(404).json({ message: 'Service not found' });
            res.json(service);
        } catch (err) {
            res.status(500).json({ message: 'Error fetching service', error: err });
        }
    });

    app.post('/api/services', async (req, res) => {
        try {
            const payload = {
                provider_id: req.body.provider_id,
                category_id: req.body.category_id,
                title: req.body.title,
                description: req.body.description || '',
                price: Number(req.body.price) || 0,
                price_type: req.body.price_type || 'fixed',
                experience_years: Number(req.body.experience_years) || 0,
                location: req.body.location || '',
                is_active: req.body.is_active !== undefined ? req.body.is_active : true,
            };
            const service = new Service(payload);
            await service.save();
            res.status(201).json(service);
        } catch (err) {
            res.status(500).json({ message: 'Error adding service', error: err });
        }
    });

    app.delete('/api/services/:id', async (req, res) => {
        try {
            const deleted = await Service.findByIdAndDelete(req.params.id);
            if (!deleted) return res.status(404).json({ message: 'Service not found' });
            res.json({ message: 'Service deleted', id: req.params.id });
        } catch (err) {
            res.status(500).json({ message: 'Error deleting service', error: err });
        }
    });

    // service requests endpoints
    app.get('/api/service-requests', async (req, res) => {
        try {
            await applyAutomationRules();
            const filter = {};
            if (req.query.provider_id) filter.provider_id = req.query.provider_id;
            if (req.query.taker_id) filter.taker_id = req.query.taker_id;
            if (req.query.status) filter.status = req.query.status;
            if (req.query.service_id) filter.service_id = req.query.service_id;
            const requests = await ServiceRequest.find(filter).sort({ created_at: -1 });
            res.json(requests.map(r => ({
                ...r.toObject(),
                id: r.uuid,
            })));
        } catch (err) {
            res.status(500).json({ message: 'Error fetching service requests', error: err });
        }
    });

    app.post('/api/service-requests', async (req, res) => {
        try {
            const service = await Service.findById(req.body.service_id);
            if (!service) {
                return res.status(404).json({ message: 'Service not found for booking' });
            }

            const payment_method = req.body.payment_method === 'cod' ? 'cod' : 'online';
            const amounts = calcPaymentBreakdown(service.price);
            const paymentProof = {
                razorpay_order_id: req.body.razorpay_order_id || '',
                razorpay_payment_id: req.body.razorpay_payment_id || '',
                razorpay_signature: req.body.razorpay_signature || '',
            };

            if (payment_method === 'online') {
                const verified = verifyRazorpaySignature({
                    orderId: paymentProof.razorpay_order_id,
                    paymentId: paymentProof.razorpay_payment_id,
                    signature: paymentProof.razorpay_signature,
                });
                if (!verified) {
                    return res.status(400).json({ message: 'Online payment is not verified' });
                }
            }

            const payload = {
                uuid: uuidv4(),
                taker_id: req.body.taker_id,
                provider_id: req.body.provider_id,
                service_id: req.body.service_id,
                description: req.body.description,
                address: req.body.address || '',
                preferred_date: req.body.preferred_date || null,
                preferred_time: req.body.preferred_time || null,
                status: req.body.status || 'pending',
                payment_method,
                ...amounts,
                payment_status: payment_method === 'online' ? 'paid' : 'cod_pending',
                escrow_status: payment_method === 'online' ? 'held' : 'not_applicable',
                payout_status: 'not_released',
                razorpay_order_id: paymentProof.razorpay_order_id,
                razorpay_payment_id: paymentProof.razorpay_payment_id,
                razorpay_signature: paymentProof.razorpay_signature,
                payment_received_at: payment_method === 'online' ? new Date() : null,
            };
            const serviceRequest = new ServiceRequest(payload);
            await serviceRequest.save();

            const providerSubscription = await Subscription.findOne({ provider_id: req.body.provider_id });
            if (providerSubscription) {
                providerSubscription.leads_used = providerSubscription.leads_limit
                    ? Math.min(providerSubscription.leads_limit, providerSubscription.leads_used + 1)
                    : providerSubscription.leads_used + 1;
                await providerSubscription.save();
            } else {
                const freeConfig = SUBSCRIPTION_PLANS.free;
                await Subscription.create({
                    provider_id: req.body.provider_id,
                    plan_name: freeConfig.plan_name,
                    price: freeConfig.price,
                    billing_interval: 'monthly',
                    status: 'free',
                    auto_renew: false,
                    leads_limit: freeConfig.leads_limit,
                    leads_used: 1,
                    verified_badge: freeConfig.verified_badge,
                    featured_listing: freeConfig.featured_listing,
                    renewal_date: makeRenewalDate('monthly'),
                });
            }

            if (payment_method === 'online' && paymentProof.razorpay_order_id) {
                await PaymentTransaction.findOneAndUpdate(
                    { razorpay_order_id: paymentProof.razorpay_order_id },
                    {
                        $set: {
                            request_uuid: payload.uuid,
                            status: 'verified',
                            razorpay_payment_id: paymentProof.razorpay_payment_id,
                            razorpay_signature: paymentProof.razorpay_signature,
                        },
                    }
                );
            }
            res.status(201).json({
                ...serviceRequest.toObject(),
                id: serviceRequest.uuid,
            });
        } catch (err) {
            console.error('Error creating service request:', err);
            res.status(500).json({ message: 'Error creating service request', error: err.message || err });
        }
    });

    app.put('/api/service-requests/:id', async (req, res) => {
        try {
            const current = await ServiceRequest.findOne({ uuid: req.params.id });
            if (!current) return res.status(404).json({ message: 'Service request not found' });

            const status = req.body.status;
            const updatePayload = {};
            if (status) updatePayload.status = status;

            if (status === 'completed') {
                updatePayload.completed_at = new Date();
            }

            if (req.body.mark_cash_collected === true && current.payment_method === 'cod') {
                updatePayload.payment_status = 'cod_collected';
                updatePayload.cod_collected_at = new Date();
            }

            if (req.body.confirm_completion === true && current.payment_method === 'online') {
                updatePayload.completion_confirmed_by_taker = true;
                updatePayload.confirmed_at = new Date();
                updatePayload.escrow_status = 'released';
                updatePayload.payout_status = 'released';
            }

            const updated = await ServiceRequest.findOneAndUpdate(
                { uuid: req.params.id },
                updatePayload,
                { new: true }
            );
            if (!updated) return res.status(404).json({ message: 'Service request not found' });
            res.json({
                ...updated.toObject(),
                id: updated.uuid,
            });
        } catch (err) {
            res.status(500).json({ message: 'Error updating service request', error: err });
        }
    });

    app.get('/api/provider-wallet/:providerId', async (req, res) => {
        try {
            await applyAutomationRules();
            const wallet = await buildProviderWallet(req.params.providerId);
            res.json(wallet);
        } catch (err) {
            res.status(500).json({ message: 'Error loading wallet', error: err.message || err });
        }
    });

    app.post('/api/provider-payout/:providerId/request', async (req, res) => {
        try {
            const wallet = await buildProviderWallet(req.params.providerId);
            res.json({
                message: 'Payout request submitted',
                requested_amount: wallet.available_balance,
                bank_name: req.body.bank_name || '',
                account_number: req.body.account_number || '',
                upi_id: req.body.upi_id || '',
            });
        } catch (err) {
            res.status(500).json({ message: 'Error requesting payout', error: err.message || err });
        }
    });

    app.get('/api/admin/payments', async (_req, res) => {
        try {
            const rows = await ServiceRequest.find().sort({ created_at: -1 });
            res.json(rows.map(withRequestId));
        } catch (err) {
            res.status(500).json({ message: 'Error loading payments', error: err.message || err });
        }
    });

    app.get('/api/admin/escrow', async (_req, res) => {
        try {
            await applyAutomationRules();
            const rows = await ServiceRequest.find({ payment_method: 'online' }).sort({ created_at: -1 });
            res.json(rows.map(withRequestId));
        } catch (err) {
            res.status(500).json({ message: 'Error loading escrow', error: err.message || err });
        }
    });

    app.post('/api/admin/escrow/:id/release', async (req, res) => {
        try {
            const updated = await ServiceRequest.findOneAndUpdate(
                { uuid: req.params.id, payment_method: 'online' },
                {
                    $set: {
                        escrow_status: 'released',
                        payout_status: 'released',
                        completion_confirmed_by_taker: true,
                        confirmed_at: new Date(),
                    },
                },
                { new: true }
            );
            if (!updated) return res.status(404).json({ message: 'Booking not found' });
            res.json(withRequestId(updated));
        } catch (err) {
            res.status(500).json({ message: 'Error releasing escrow', error: err.message || err });
        }
    });

    const PORT = Number(process.env.PORT) || 5000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });

// we have done with the pm2 for the backend server as the production manager. To start the server with pm2, run the following command in the terminal:
// pm2 start server.js --name "localconnect-backend"

// To view the logs of the server, run:
// pm2 logs localconnect-backend

// To stop the server, run:
// pm2 stop localconnect-backend

// To restart the server, run:
// pm2 restart localconnect-backend

// To view the status of the server, run:
// pm2 status localconnect-backend