import React, { useState } from 'react';
import { FaTimes, FaHeadset, FaPaperPlane, FaPhoneAlt, FaEnvelope } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';

export default function SupportModal({ isOpen, onClose, user }) {
  const { t, isTamil } = useLanguage();

  const [formData, setFormData] = useState({
    name: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    subject: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const token = localStorage.getItem('nikah_token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/support', {
        method: 'POST',
        headers,
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg(
          isTamil
            ? 'உங்கள் கோரிக்கை பெறப்பட்டது! எங்களது உதவி மையம் விரைவில் உங்களை தொடர்பு கொள்ளும்.'
            : 'Your support ticket has been registered. Our helpline will respond promptly.'
        );
        setTimeout(() => {
          onClose();
          setSuccessMsg('');
        }, 2500);
      } else {
        setErrorMsg(data.message || 'Failed to submit inquiry.');
      }
    } catch (err) {
      setErrorMsg('Error submitting ticket.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#faf7ef] border-2 border-[#caa85d] rounded-2xl shadow-2xl overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#163828] via-[#21543c] to-[#163828] py-3.5 px-4 flex items-center justify-between border-b-2 border-[#caa85d] text-white">
          <div className="flex items-center gap-2">
            <FaHeadset className="text-[#ecd08c] text-base" />
            <h3 className="font-extrabold text-base text-[#fffae6] tracking-wide font-cinzel">
              {isTamil ? 'வாடிக்கையாளர் உதவி மையம்' : 'CUSTOMER SUPPORT DESK'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 text-base"
            aria-label="Close"
          >
            <FaTimes />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs sm:text-sm">
          {successMsg && (
            <div className="p-3 bg-green-100 border border-green-300 text-green-800 rounded-lg text-xs font-bold text-center">
              ✓ {successMsg}
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-xs font-bold">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#44351b] mb-1">
              {isTamil ? 'உங்கள் பெயர்' : 'Full Name'} *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-1.5 bg-white border border-[#c5b597] rounded focus:ring-2 focus:ring-[#8a6d2f] text-gray-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-[#44351b] mb-1">
                {isTamil ? 'மின்னஞ்சல்' : 'Email'} *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-1.5 bg-white border border-[#c5b597] rounded focus:ring-2 focus:ring-[#8a6d2f] text-gray-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#44351b] mb-1">
                {isTamil ? 'தொலைபேசி எண்' : 'Phone'}
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-1.5 bg-white border border-[#c5b597] rounded focus:ring-2 focus:ring-[#8a6d2f] text-gray-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#44351b] mb-1">
              {isTamil ? 'விசாரணை தலைப்பு' : 'Subject'} *
            </label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder={isTamil ? 'எ.கா: வரன் பதிவு உதவி / சுயவிவர திருத்தம்' : 'e.g. Profile Registration Help / Details Update'}
              required
              className="w-full px-3 py-1.5 bg-white border border-[#c5b597] rounded focus:ring-2 focus:ring-[#8a6d2f] text-gray-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#44351b] mb-1">
              {isTamil ? 'செய்தி / விபரம்' : 'Message Details'} *
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={3}
              placeholder={isTamil ? 'உங்கள் கேள்வியை அல்லது பிரச்சனையை விவரிக்கவும்...' : 'Please describe your request or question...'}
              required
              className="w-full px-3 py-2 bg-white border border-[#c5b597] rounded focus:ring-2 focus:ring-[#8a6d2f] text-gray-900"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg btn-gold font-bold text-xs flex items-center justify-center gap-1.5 shadow transition disabled:opacity-50"
          >
            <FaPaperPlane />
            <span>{loading ? (isTamil ? 'அனுப்பப்படுகிறது...' : 'Sending...') : (isTamil ? 'கோரிக்கையை சமர்ப்பிக்கவும்' : 'Submit Support Request')}</span>
          </button>
        </form>

        <div className="bg-[#ede4d1] p-3 text-center text-xs text-[#44351b] border-t border-[#caa85d]">
          <span>Helpline: <strong>+91 9171896625</strong> (10:00 AM - 6:00 PM)</span>
        </div>
      </div>
    </div>
  );
}
