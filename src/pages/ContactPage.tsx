import React, { useState } from 'react';
import { Phone, Mail, MapPin, Send, HelpCircle, ChevronDown, ChevronUp, Clock, CheckCircle } from 'lucide-react';
import { useToast } from '../context/ToastContext.tsx';

const FAQS = [
  {
    q: 'How does FreshCart deliver in 10 to 15 minutes?',
    a: 'We operate temperature-controlled hyper-local micro fulfillment dark stores located within a 2-3 km radius of your neighborhood. When you place an order, our pickers pack your basket in 90 seconds, and electric riders dispatch it straight to your doorstep.'
  },
  {
    q: 'What is the return and refund policy if produce is not fresh?',
    a: 'We offer a 100% no-questions-asked doorstep refund. If you are unsatisfied with the quality of any fruit, vegetable, or item, hand it back to the rider or tap "Request Refund" in My Orders. We will refund the amount immediately.'
  },
  {
    q: 'Are Razorpay payments completely secure?',
    a: 'Yes. All payments are processed through Razorpay using bank-grade 256-bit SSL encryption. We never store credit card numbers, CVVs, or bank passwords on our servers.'
  },
  {
    q: 'Can I choose Cash on Delivery (COD)?',
    a: 'Absolutely! You can choose Cash on Delivery at checkout and pay using cash or UPI QR code directly to the delivery partner when they arrive.'
  },
  {
    q: 'What is the minimum order for free delivery?',
    a: 'All orders of ₹499 and above receive FREE express delivery! For orders below ₹499, a nominal delivery fee of ₹30 is applied.'
  }
];

export const ContactPage: React.FC = () => {
  const { showToast } = useToast();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      showToast('Please fill all required support fields', 'error');
      return;
    }
    setSubmitted(true);
    showToast('Your message has been received! Our support team will reply within 30 minutes.', 'success');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-12">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
          24x7 Customer Support
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">We're Here to Help</h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Have an inquiry about an active delivery, wholesale bulk ordering, or quality concern? Contact us anytime.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 font-bold">
            <Phone className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Phone Support</h3>
          <p className="text-xs text-slate-500">Toll-free customer hotline</p>
          <p className="text-xs font-bold font-mono text-emerald-700 pt-1">1800-FRESH-CART</p>
          <span className="text-[10px] text-slate-400 block">Available 24 hours / 7 days</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 font-bold">
            <Mail className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Email Support</h3>
          <p className="text-xs text-slate-500">For orders, billing & refunds</p>
          <p className="text-xs font-bold text-emerald-700 pt-1">support@freshcart.com</p>
          <span className="text-[10px] text-slate-400 block">Response within 30 minutes</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 font-bold">
            <MapPin className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Registered Office</h3>
          <p className="text-xs text-slate-500">FreshCart E-Commerce Pvt Ltd</p>
          <p className="text-xs font-semibold text-slate-700 pt-1">Plot 42, Green Avenue, Tech Park, Indiranagar, Bengaluru - 560038</p>
        </div>
      </div>

      {/* Support Form & FAQs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Support Ticket Form */}
        <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-2xs">
          <h3 className="text-lg font-bold text-slate-900 mb-1">Send a Message</h3>
          <p className="text-xs text-slate-500 mb-5">Our care specialists are ready to resolve any issue</p>

          {submitted ? (
            <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-3">
              <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
              <h4 className="text-sm font-bold text-emerald-950">Message Sent Successfully!</h4>
              <p className="text-xs text-emerald-800">
                Ticket Reference: <span className="font-mono font-bold">#TK-{Date.now().toString().slice(-6)}</span>
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl"
              >
                Send Another Inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Subject</label>
                <input
                  type="text"
                  placeholder="e.g. Delivery status inquiry or feedback"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Message Description *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Tell us what happened or how we can assist you..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Ticket</span>
              </button>
            </form>
          )}
        </div>

        {/* FAQs */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <HelpCircle className="w-4 h-4 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">Frequently Asked Questions</h3>
          </div>

          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between text-xs font-bold text-slate-800 gap-3"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-50 bg-slate-50/50">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
