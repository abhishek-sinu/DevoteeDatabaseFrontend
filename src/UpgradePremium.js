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

  let cashfree;
  
  let insitialzeSDK = async function () {

    cashfree = await load({
      mode: "sandbox",
    })
  }

  const plans = [
      {
        id: 'monthly',
        title: 'Monthly Premium',
        price: 10,
        duration: '1 Month',
        features: [
          'Daily Sadhana Entry',
          'View & Download monthly sadhana sheet (PDF/XLS)',
          'See 3/6 month sadhana performance',
          'Choose your own template to fill sadhana card',
          'Full Technical Support'
        ],
        discount: 0,
        color: '#efa208',
        badge: 'BEST VALUE',
        highlight: false,
      },
      {
        id: '6month',
        title: '6 Month Premium',
        price: 50,
        duration: '6 Months',
        features: [
          'Daily Sadhana Entry',
          'View & Download monthly sadhana sheet (PDF/XLS)',
          'See 3/6 month sadhana performance',
          'Choose your own template to fill sadhana card',
          'Full Technical Support',
          '17% Discount (₹10 off)',
          'Early Access to New Features'
        ],
        discount: 10,
        color: '#3d5a1a',
        badge: 'MOST POPULAR',
        highlight: true,
      },
      {
        id: 'yearly',
        title: 'Yearly Premium',
        price: 100,
        duration: '12 Months',
        features: [
          'Daily Sadhana Entry',
          'View & Download monthly sadhana sheet (PDF/XLS)',
          'See 3/6 month sadhana performance',
          'Choose your own template to fill sadhana card',
          'Full Technical Support',
          'Annual Sadhana Report',
          '17% Discount (₹20 off)',
        ],
        discount: 20,
        color: '#0d6efd',
        badge: 'SAVE MORE',
        highlight: false,
      }
    ];

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
			let res = await axios.get("http://localhost:5000/api/payment", {
				params: {
					user_details,
					amount
				}
			});
			if(res.data && res.data.payment_session_id){
				console.log(res.data)
				setOrderId(res.data.order_id)
				return { sessionId: res.data.payment_session_id, orderId: res.data.order_id };
			}
		} catch (error) {
			console.log(error)
		}
	}

	const verifyPayment = async (orderIdToVerify, plan) => {
		try {
			let res = await axios.post("http://localhost:5000/api/verify", {
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
			let { sessionId, orderId: newOrderId } = await getSessionId(plan.price);
			let checkoutOptions = {
				paymentSessionId: sessionId,
				redirectTarget: "_modal",
			};
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
					<div className="d-flex flex-wrap gap-4 justify-content-center" style={{ width: '100%', maxWidth: 1200 }}>
						{plans.map(plan => (
							<div
								key={plan.id}
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
										<span className="badge bg-primary" style={{ fontSize: '1.1rem', background: plan.color, borderRadius: 8 }}>{plan.duration}</span>
										{plan.badge && (
											<span className="badge ms-2" style={{ background: plan.highlight ? '#0d6efd' : plan.color, color: '#fff', fontWeight: 600, fontSize: '1rem', padding: '7px 18px', borderRadius: 14, boxShadow: '0 2px 8px rgba(61,90,26,0.12)' }}>{plan.badge}</span>
										)}
									</div>
									<ul className="mb-3" style={{ paddingLeft: 18 }}>
										{plan.features.map((feature, idx) => (
											<li key={idx} style={{ fontSize: '1.05rem', color: '#3d5a1a', marginBottom: 6, fontWeight: 500, letterSpacing: '0.2px' }}>{feature}</li>
										))}
									</ul>
									<div className="mb-2 d-flex align-items-center">
										<span style={{ fontSize: '2.2rem', fontWeight: 700, color: plan.color, letterSpacing: '0.5px' }}>₹{plan.price}</span>
										{plan.discount > 0 && (
											<span className="ms-2 text-success" style={{ fontWeight: 600, fontSize: '1.1rem' }}>
												Save {Math.round((plan.discount / (plan.price + plan.discount)) * 100)}%
											</span>
										)}
									</div>
									{error && selectedPlanId === plan.id && <div className="alert alert-danger">{error}</div>}
									<button
										className={`btn w-100 fw-bold mt-2 ${plan.highlight ? 'btn-primary' : 'btn-warning'}`}
										style={{ color: plan.highlight ? '#fff' : plan.color, fontSize: '1.15rem', borderRadius: 10, background: plan.highlight ? plan.color : '#fffbe9', border: plan.highlight ? `2px solid ${plan.color}` : 'none', boxShadow: plan.highlight ? '0 2px 8px rgba(61,90,26,0.10)' : 'none', transition: 'background 0.2s' }}
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
