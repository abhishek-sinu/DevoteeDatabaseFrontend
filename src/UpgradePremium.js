import React from "react";
import axios from "axios";
import { useState, useEffect, useRef } from "react";
import { load } from '@cashfreepayments/cashfree-js';

export default function UpgradePremium({ name, email, phone, onClose }) {
	const [orderId, setOrderId] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [modalOpen, setModalOpen] = useState(false);
	const [selectedPlanId, setSelectedPlanId] = useState(null);
	const [confirmation, setConfirmation] = useState(null);
	const [confirmationType, setConfirmationType] = useState('success'); // 'success' or 'failure'
	const plansContainerRef = useRef(null);
	const firstPlanRef = useRef(null);
	let cashfree;
	// Determine Cashfree mode from environment variable (default to 'sandbox')
	const CASHFREE_MODE = process.env.REACT_APP_CASHFREE_MODE === 'PROD' ? 'production' : 'sandbox';
	let insitialzeSDK = async function () {
		cashfree = await load({
			mode: CASHFREE_MODE,
		})
	}

// const UpgradePremium = () => (
//   <div style={{
//     display: "flex",
//     flexDirection: "column",
//     alignItems: "center",
//     justifyContent: "center",
//     height: "80vh",
//     fontSize: "2rem",
//     color: "#888"
//   }}>
//     <span>Coming Soon</span>
//     <p style={{ fontSize: "1rem", color: "#aaa" }}>Payment gateway integration is in progress.</p>
//   </div>
// );

	const plans = [
		{
			id: 'monthly',
			title: 'Monthly Premium',
			price: 10,
			originalPrice: 20,
			duration: '1 Month',
			features: [
				'Daily Sadhana Entry',
				'View & Download monthly sadhana sheet (PDF/XLS)',
				'See 3/6 month sadhana performance',
				'Choose your own template to fill sadhana card',
				'Full Technical Support'
			],
			discount: 50, // percent
			color: '#efa208',
			badge: 'BEST VALUE',
			highlight: false,
		},
		{
			id: '6month',
			title: '6 Month Premium',
			price: 60,
			originalPrice: 120,
			duration: '6 Months',
			features: [
				'Daily Sadhana Entry',
				'View & Download monthly sadhana sheet (PDF/XLS)',
				'See 3/6 month sadhana performance',
				'Choose your own template to fill sadhana card',
				'Full Technical Support',
				'Early Access to New Features'
			],
			discount: 50, // percent
			color: '#3d5a1a',
			badge: 'MOST POPULAR',
			highlight: true,
		},
		{
			id: 'yearly',
			title: 'Yearly Premium',
			price: 120,
			originalPrice: 240,
			duration: '12 Months',
			features: [
				'Daily Sadhana Entry',
				'View & Download monthly sadhana sheet (PDF/XLS)',
				'See 3/6 month sadhana performance',
				'Choose your own template to fill sadhana card',
				'Full Technical Support',
				'Annual Sadhana Report',
			],
			discount: 50, // percent
			color: '#0d6efd',
			badge: 'SAVE MORE',
			highlight: false,
		}
	];

	useEffect(() => {
		if (window.innerWidth >= 768) return;

		const container = plansContainerRef.current;
		const firstCard = firstPlanRef.current;

		requestAnimationFrame(() => {
			if (container) {
				container.scrollTo({ left: 0, behavior: 'auto' });
			}
			if (firstCard) {
				firstCard.scrollIntoView({ block: 'nearest', inline: 'start', behavior: 'auto' });
			}
			window.scrollTo({ top: 0, behavior: 'auto' });
		});
	}, []);

  insitialzeSDK()

	const getSessionId = async (amount) => {
		try {
			// Replace with devotee details from API
			const user_details = {
				customer_id: phone, // Replace with devotee id if available
				customer_phone: phone,
				customer_name: name,
				customer_email: email
			};
			let res = await axios.get(`${process.env.REACT_APP_API_BASE}/api/payment`, {
				params: {
					user_details,
					amount
				}
			});
			// Log the full backend response for debugging
			console.log('Full /payment backend response:', res.data);
			if(res.data && res.data.payment_session_id){
				setOrderId(res.data.order_id)
				// Log the payment_session_id value
				console.log('Using payment_session_id:', res.data.payment_session_id);
				return { sessionId: res.data.payment_session_id, orderId: res.data.order_id };
			} else {
				// Log if payment_session_id is missing
				console.error('payment_session_id is missing in backend response:', res.data);
			}
		} catch (error) {
			console.log(error)
		}
	}

	const verifyPayment = async (orderIdToVerify, plan) => {
		try {
			let res = await axios.post(`${process.env.REACT_APP_API_BASE}/api/verify`, {
				orderId: orderIdToVerify,
				duration: plan?.id // send plan id as duration (e.g., 'monthly', '6month', 'yearly')
			})
			console.log('verifyPayment response:', res.data); // DEBUG
			if(res && res.data && (res.data.status === 'success' || res.data.order_status === 'PAID' || res.data.order_status === 'SUCCESS')){
				setConfirmation({
					planTitle: plan?.title || '',
					planDuration: plan?.duration || '',
					planAmount: plan?.price || '',
					paymentId: orderIdToVerify,
					date: new Date().toLocaleString(),
				});
				setConfirmationType('success');
			} else {
				setConfirmation({
					planTitle: plan?.title || '',
					planDuration: plan?.duration || '',
					planAmount: plan?.price || '',
					paymentId: orderIdToVerify,
					date: new Date().toLocaleString(),
				});
				setConfirmationType('failure');
			}
		} catch (error) {
			setConfirmation({
				planTitle: plan?.title || '',
				planDuration: plan?.duration || '',
				planAmount: plan?.price || '',
				paymentId: orderIdToVerify,
				date: new Date().toLocaleString(),
			});
			setConfirmationType('failure');
			console.log(error)
		}
	}

	const handleClick = async (planId) => {
		setSelectedPlanId(planId);
		const plan = plans.find(p => p.id === planId);
		if (!plan) return;
		try {
			let { sessionId, orderId: newOrderId } = await getSessionId(plan.price) || {};
			// Validate payment_session_id before proceeding
			if (!sessionId || typeof sessionId !== 'string' || !sessionId.trim()) {
				setError('Payment session could not be created. Please try again.');
				console.error('Invalid or missing payment_session_id:', sessionId);
				return;
			}
			let checkoutOptions = {
				paymentSessionId: sessionId,
				redirectTarget: "_modal",
			};
			// Log the value being sent to Cashfree
			console.log('Invoking Cashfree with paymentSessionId:', sessionId);
			setModalOpen(true); // Blur main content when modal opens
			cashfree.checkout(checkoutOptions).then((res) => {
				console.log("payment initialized");
				verifyPayment(newOrderId, plan);
				setModalOpen(false); // Remove blur when modal closes
			}).catch(() => {
				setModalOpen(false); // Remove blur if modal fails
			});
		} catch (error) {
			setModalOpen(false);
			console.log(error);
		}
	}

	// UI
	return (
		<div>
			<div className={modalOpen ? "blurred-content" : ""}>
				{/* Premium Cards UI */}
				<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', background: 'linear-gradient(135deg,#f9f6ee 60%,#e6e1d3 100%)' }}>
					<div ref={plansContainerRef} className="d-flex flex-wrap gap-4 justify-content-center" style={{ width: '100%', maxWidth: 1200 }}>
						{plans.map((plan, index) => (
							<div
								key={plan.id}
								ref={index === 0 ? firstPlanRef : null}
								className={`card shadow-lg premium-card ${plan.highlight ? 'border-4 border-primary scale-up' : ''}`}
								style={{
									maxWidth: 370,
									minWidth: 320,
									borderRadius: 22,
									border: `2.5px solid ${plan.color}`,
									background: plan.highlight ? '#fff' : '#fffbe9',
									boxShadow: plan.highlight ? '0 8px 32px rgba(61,90,26,0.18)' : '0 2px 8px rgba(61,90,26,0.08)',
									position: 'relative',
									transition: 'transform 0.2s',
								}}
							>
								{/* Card Header */}
								<div className="card-header d-flex justify-content-between align-items-center" style={{ background: plan.color, color: '#fff', borderTopLeftRadius: 22, borderTopRightRadius: 22, fontSize: '1.3rem', fontWeight: 700, letterSpacing: '0.5px', boxShadow: '0 2px 8px rgba(61,90,26,0.10)' }}>
									<span>{plan.title}</span>
								</div>
								<div className="card-body">
									<div className="mb-2 d-flex align-items-center justify-content-between">
										<span className="badge" style={{ fontSize: '1.1rem', background: plan.id === 'monthly' ? '#efa208' : plan.id === '6month' ? '#3d5a1a' : plan.id === 'yearly' ? '#ff1493' : plan.color, color: '#fff', borderRadius: 8 }}>{plan.duration}</span>
										{plan.badge && (
											<span className="badge ms-2" style={{ background: plan.id === 'monthly' ? '#efa208' : plan.id === '6month' ? '#3d5a1a' : plan.id === 'yearly' ? '#ff1493' : plan.color, color: '#fff', fontWeight: 600, fontSize: '1rem', padding: '7px 18px', borderRadius: 14, boxShadow: '0 2px 8px rgba(61,90,26,0.12)' }}>{plan.badge}</span>
										)}
									</div>
									<ul className="mb-3" style={{ paddingLeft: 18 }}>
										{plan.features.map((feature, idx) => (
											<li key={idx} style={{ fontSize: '1.05rem', color: '#3d5a1a', marginBottom: 6, fontWeight: 500, letterSpacing: '0.2px' }}>{feature}</li>
										))}
									</ul>
									<div className="mb-2 d-flex align-items-center">
										<span style={{ fontSize: '2.2rem', fontWeight: 700, color: plan.color, letterSpacing: '0.5px' }}>₹{plan.price}</span>
										<span className="ms-2 text-muted" style={{ textDecoration: 'line-through', fontSize: '1.1rem', fontWeight: 500 }}>
											₹{plan.originalPrice}
										</span>
										{plan.discount > 0 && (
											<span className="ms-2 text-success" style={{ fontWeight: 600, fontSize: '1.1rem' }}>
												{plan.discount}% OFF
											</span>
										)}
									</div>
									{error && selectedPlanId === plan.id && <div className="alert alert-danger">{error}</div>}
									<button
										className="btn w-100 fw-bold mt-2"
										style={{
											color: '#fff',
											fontSize: '1.15rem',
											borderRadius: 10,
											background:
												plan.id === 'monthly' ? '#efa208' :
												plan.id === '6month' ? '#3d5a1a' :
												plan.id === 'yearly' ? '#fa05a0' : '#7a9c5c',
											border: 'none',
											boxShadow: '0 2px 8px rgba(61,90,26,0.10)',
											transition: 'background 0.2s',
										}}
										onClick={() => handleClick(plan.id)}
										disabled={loading && selectedPlanId === plan.id}
									>
										{loading && selectedPlanId === plan.id ? "Processing..." : `Pay & Unlock Premium`}
									</button>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
			{/* Confirmation Modal */}
			{confirmation && (
				<div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.25)', zIndex: 9999 }}>
					<div className="modal-dialog modal-dialog-centered">
						<div className="modal-content shadow-lg" style={{ borderRadius: 18 }}>
							<div className={`modal-header ${confirmationType === 'success' ? 'bg-success' : 'bg-danger'} text-white`} style={{ borderTopLeftRadius: 18, borderTopRightRadius: 18 }}>
								<h5 className="modal-title fw-bold">
									{confirmationType === 'success' ? 'Payment Successful!' : 'Payment Unsuccessful'}
								</h5>
							</div>
							<div className="modal-body text-center">
								<div className="mb-3">
									<span className={`badge ${confirmationType === 'success' ? 'bg-success' : 'bg-danger'}`} style={{ fontSize: '1.2rem', padding: '8px 24px', borderRadius: 12 }}>
										{confirmationType === 'success' ? `You are upgraded to ${confirmation.planTitle}` : 'Payment was unsuccessful'}
									</span>
								</div>
								<div className="mb-2">
									<span className="fw-bold">Duration:</span> {confirmation.planDuration}
								</div>
								<div className="mb-2">
									<span className="fw-bold">Amount:</span> ₹{confirmation.planAmount}
								</div>
								<div className="mb-2">
									<span className="fw-bold">Payment ID:</span> {confirmation.paymentId}
								</div>
								<div className="mb-2">
									<span className="fw-bold">Date:</span> {confirmation.date}
								</div>
								{confirmationType === 'success' ? (
									<div className="mt-3">
										<span className="text-success fw-bold">Enjoy your premium features!</span>
									</div>
								) : (
									<div className="mt-3">
										<span className="text-danger fw-bold">If any amount was deducted, it will be refunded in 3-5 business days.</span>
									</div>
								)}
							</div>
							<div className="modal-footer">
								<button className={`btn fw-bold ${confirmationType === 'success' ? 'btn-success' : 'btn-danger'}`} style={{ borderRadius: 8 }} onClick={() => { setConfirmation(null); onClose && onClose(); }}>Close</button>
							</div>
						</div>
					</div>
				</div>
			)}
			{/* Optionally, add a modal overlay for visual effect */}
			{modalOpen && <div className="modal-blur-overlay"></div>}
		</div>
	);
}

