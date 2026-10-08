import React, { useState, useEffect } from 'react';
import {
  FaTimes,
  FaEnvelope,
  FaEnvelopeOpenText,
  FaLock,
  FaKey,
  FaCheckCircle,
  FaArrowLeft,
  FaEye,
  FaEyeSlash,
  FaSpinner,
} from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';

export default function ForgotPasswordModal({ isOpen, onClose, onOpenLogin }) {
  const { isTamil } = useLanguage();

  // Steps: 1: 'enter_identifier' | 2: 'enter_otp' | 3: 'new_password' | 4: 'success'
  const [step, setStep] = useState(1);
  const [identifier, setIdentifier] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [needsEmailInput, setNeedsEmailInput] = useState(false);
  const [userId, setUserId] = useState('');
  const [emailMasked, setEmailMasked] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  // Timer countdown for resending OTP
  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setIdentifier('');
      setEmailInput('');
      setNeedsEmailInput(false);
      setUserId('');
      setEmailMasked('');
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
      setErrorMsg('');
      setInfoMsg('');
      setResendTimer(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 1. Send OTP via Email
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (!identifier.trim()) {
      setErrorMsg(
        isTamil
          ? 'தயவுசெய்து உங்கள் பதிவு செய்யப்பட்ட மின்னஞ்சல், மொபைல் எண் அல்லது நிகாஹ் ஐடியை உள்ளிடவும்.'
          : 'Please enter your registered Email, Mobile number, or Nikah ID.'
      );
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setInfoMsg('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: identifier.trim(),
          email: emailInput.trim(),
        }),
      });
      const data = await res.json();

      if (data.success) {
        setUserId(data.userId);
        setEmailMasked(data.emailMasked || identifier);
        setStep(2);
        setResendTimer(45); // 45 seconds countdown before resend
        setInfoMsg(
          data.message ||
            (isTamil
              ? `உங்கள் மின்னஞ்சல் முகவரிக்கு (${data.emailMasked || ''}) 6-இலக்க OTP அனுப்பப்பட்டுள்ளது.`
              : `6-digit OTP verification code sent to your email (${data.emailMasked || ''}).`)
        );
      } else if (data.needsEmailInput) {
        setNeedsEmailInput(true);
        setErrorMsg(data.message || (isTamil
          ? 'இந்த சுயவிவரத்தில் மின்னஞ்சல் இல்லை. OTP பெற மின்னஞ்சல் முகவரியை உள்ளிடவும்.'
          : 'This profile has no email address. Enter an email to receive the OTP.'));
      } else {
        setErrorMsg(data.message || (isTamil ? 'OTP அனுப்ப இயலவில்லை.' : 'Failed to send OTP.'));
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(
        isTamil
          ? 'இணைப்பு பிழை. இணைய இணைப்பை சரிபார்த்து மீண்டும் முயற்சிக்கவும்.'
          : 'Network error. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // 2. Verify Email OTP
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    if (!otp.trim() || otp.trim().length < 6) {
      setErrorMsg(
        isTamil
          ? 'தயவுசெய்து மின்னஞ்சலில் பெறப்பட்ட 6-இலக்க OTP-ஐ உள்ளிடவும்.'
          : 'Please enter the 6-digit OTP received in your email.'
      );
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setInfoMsg('');

    try {
      const res = await fetch('/api/auth/verify-reset-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, otp: otp.trim() }),
      });
      const data = await res.json();

      if (data.success) {
        setStep(3);
        setInfoMsg(
          isTamil
            ? 'OTP சரிபார்க்கப்பட்டது! புதிய கடவுச்சொல்லை உள்ளிடவும்.'
            : 'OTP verified! Please set your new password.'
        );
      } else {
        setErrorMsg(data.message || (isTamil ? 'தவறான அல்லது காலாவதியான OTP.' : 'Invalid or expired OTP.'));
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(isTamil ? 'சரிபார்ப்பில் பிழை ஏற்பட்டது.' : 'Failed to verify OTP.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Reset Password
  const handleResetPassword = async (e) => {
    if (e) e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setErrorMsg(
        isTamil
          ? 'கடவுச்சொல் குறைந்தது 6 எழுத்துகள் அல்லது எண்களைக் கொண்டிருக்க வேண்டும்.'
          : 'Password must be at least 6 characters.'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg(
        isTamil
          ? 'கடவுச்சொற்கள் பொருந்தவில்லை. மீண்டும் சரிபார்க்கவும்.'
          : 'Passwords do not match.'
      );
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setInfoMsg('');

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, otp: otp.trim(), newPassword }),
      });
      const data = await res.json();

      if (data.success) {
        setStep(4);
      } else {
        setErrorMsg(data.message || (isTamil ? 'கடவுச்சொல் மாற்றுவதில் பிழை.' : 'Failed to update password.'));
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(isTamil ? 'இணைப்பு பிழை ஏற்பட்டது.' : 'Network error updating password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#faf7ef] border-2 border-[#caa85d] rounded-2xl shadow-2xl overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#163828] via-[#21543c] to-[#163828] py-3.5 px-5 flex items-center justify-between border-b-2 border-[#caa85d] text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-300/40 flex items-center justify-center text-amber-300 shadow">
              <FaEnvelopeOpenText className="text-base" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#fffae6] tracking-wide font-cinzel">
                {isTamil ? 'கடவுச்சொல் மீட்பு (Email OTP)' : 'Forgot Password (Email OTP)'}
              </h3>
              <p className="text-[11px] text-[#edd48e]">
                {step === 1 && (isTamil ? 'மின்னஞ்சல் OTP மூலம் கடவுச்சொல்லை மீட்டெடுக்கவும்' : 'Recover access via Email OTP')}
                {step === 2 && (isTamil ? 'மின்னஞ்சல் OTP-ஐ உள்ளிடவும்' : 'Enter email verification code')}
                {step === 3 && (isTamil ? 'புதிய கடவுச்சொல்லை அமைக்கவும்' : 'Set your new password')}
                {step === 4 && (isTamil ? 'வெற்றி!' : 'Success!')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 text-base transition"
            aria-label="Close"
          >
            <FaTimes />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 text-xs sm:text-sm text-gray-800">
          {errorMsg && (
            <div className="p-3 bg-red-100 border border-red-300 text-red-800 rounded-lg text-xs font-bold leading-relaxed">
              ⚠️ {errorMsg}
            </div>
          )}

          {infoMsg && (
            <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-lg text-xs font-bold leading-relaxed">
              ✓ {infoMsg}
            </div>
          )}

          {/* ─── STEP 1: Enter Email / Phone / Nikah ID ─── */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#44351b] mb-1">
                  {isTamil ? 'மின்னஞ்சல் / மொபைல் எண் / நிகாஹ் ஐடி *' : 'Registered Email, Mobile Number, or Nikah ID *'}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <FaEnvelope />
                  </span>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={isTamil ? 'எ.கா: user@gmail.com அல்லது 9876543210 அல்லது TN-1002' : 'e.g. user@gmail.com or 9876543210 or TN-1002'}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#c5b597] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8a6d2f] text-gray-900 font-semibold shadow-inner"
                  />
                </div>
                <p className="text-[11px] text-gray-500 mt-1.5 leading-relaxed">
                  {isTamil
                    ? 'உங்கள் கணக்குடன் இணைக்கப்பட்ட மின்னஞ்சல் முகவரிக்கு 6-இலக்க OTP சரிபார்ப்புக் குறியீடு அனுப்பப்படும்.'
                    : 'We will send a 6-digit OTP verification code to your registered email address.'}
                </p>
                {needsEmailInput && (
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-300 rounded-lg space-y-1.5">
                    <label className="block text-xs font-bold text-amber-900">
                      {isTamil ? 'உங்கள் மின்னஞ்சல் முகவரியை உள்ளிடவும் *' : 'This profile has no email. Enter an email address *'}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <FaEnvelope />
                      </span>
                      <input
                        type="email"
                        required
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="e.g. yourname@gmail.com"
                        className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-amber-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8a6d2f] text-gray-900 font-semibold shadow-inner"
                      />
                    </div>
                    <p className="text-[11px] text-amber-800">
                      {isTamil
                        ? 'கடவுச்சொல் மீட்பு OTP இந்த முகவரிக்கு அனுப்பப்படும்.'
                        : 'The password reset OTP will be sent to this address and saved to your profile.'}
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-lg bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-700 hover:from-emerald-800 hover:to-emerald-800 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition disabled:opacity-60 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin text-base" />
                      <span>{isTamil ? 'மின்னஞ்சல் OTP அனுப்பப்படுகிறது...' : 'Sending Email OTP...'}</span>
                    </>
                  ) : (
                    <>
                      <FaEnvelope className="text-base text-amber-200" />
                      <span>{isTamil ? 'மின்னஞ்சல் OTP அனுப்புக' : 'Send OTP via Email'}</span>
                    </>
                  )}
                </button>
              </div>

              <div className="text-center pt-1 border-t border-[#dfd2ba]">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onOpenLogin) onOpenLogin();
                  }}
                  className="text-xs text-[#1a4387] hover:underline font-bold"
                >
                  {isTamil ? '← உள்நுழைவு பக்கத்திற்கு திரும்புக' : '← Back to Login'}
                </button>
              </div>
            </form>
          )}

          {/* ─── STEP 2: Enter Email OTP ─── */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="bg-[#f5efe1] p-3 rounded-lg border border-[#dfd2ba] space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-gray-600 block">{isTamil ? 'அனுப்பப்பட்ட மின்னஞ்சல்:' : 'Sent to Email:'}</span>
                    <span className="font-mono font-bold text-[#163828] text-sm">{emailMasked}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs font-bold text-[#1a4387] hover:underline"
                  >
                    {isTamil ? 'மாற்றுக' : 'Change'}
                  </button>
                </div>
                <p className="text-[11px] text-gray-500 pt-1 border-t border-[#dfd2ba]/70">
                  {isTamil
                    ? '📩 உங்கள் மின்னஞ்சல் இன்பாக்ஸ் அல்லது ஸ்பேம் (Spam / Junk) கோப்புறையை சரிபார்க்கவும்.'
                    : '📩 Please check your inbox and Spam / Junk folder for the OTP code.'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#44351b] mb-1">
                  {isTamil ? '6-இலக்க மின்னஞ்சல் OTP குறியீடு *' : 'Enter 6-Digit Email OTP *'}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <FaKey />
                  </span>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    autoFocus
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full pl-9 pr-3 py-2.5 text-center tracking-[0.4em] text-lg font-mono font-black bg-white border-2 border-[#caa85d] rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 text-gray-900 shadow-inner"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-gray-500">
                  {resendTimer > 0 ? (
                    <span>
                      {isTamil ? `மீண்டும் அனுப்ப: ${resendTimer} விநாடிகள்` : `Resend in ${resendTimer}s`}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={loading}
                      className="text-emerald-700 hover:text-emerald-800 font-bold underline flex items-center gap-1 cursor-pointer"
                    >
                      <FaEnvelope />
                      <span>{isTamil ? 'OTP மீண்டும் அனுப்புக' : 'Resend Email OTP'}</span>
                    </button>
                  )}
                </span>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || otp.length < 6}
                  className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[#163828] via-[#21543c] to-[#163828] hover:from-[#1b4330] hover:to-[#276447] text-[#edd48e] font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition disabled:opacity-50 cursor-pointer border border-[#caa85d]"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin text-base" />
                      <span>{isTamil ? 'சரிபார்க்கப்படுகிறது...' : 'Verifying OTP...'}</span>
                    </>
                  ) : (
                    <>
                      <FaCheckCircle className="text-sm" />
                      <span>{isTamil ? 'OTP-ஐ சரிபார்க்கவும்' : 'Verify OTP'}</span>
                    </>
                  )}
                </button>
              </div>

              <div className="text-center pt-1 border-t border-[#dfd2ba]">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-gray-600 hover:text-gray-900 font-bold inline-flex items-center gap-1"
                >
                  <FaArrowLeft className="text-[10px]" />
                  <span>{isTamil ? 'முந்தைய படிக்குச் செல்ல' : 'Back'}</span>
                </button>
              </div>
            </form>
          )}

          {/* ─── STEP 3: Enter New Password ─── */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#44351b] mb-1">
                  {isTamil ? 'புதிய கடவுச்சொல் (New Password) *' : 'New Password (min 6 characters) *'}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <FaLock />
                  </span>
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    minLength={6}
                    autoFocus
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2 text-sm bg-white border border-[#c5b597] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8a6d2f] text-gray-900 shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPass ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#44351b] mb-1">
                  {isTamil ? 'புதிய கடவுச்சொல்லை உறுதி செய்க (Confirm Password) *' : 'Confirm New Password *'}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <FaLock />
                  </span>
                  <input
                    type={showConfirmPass ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2 text-sm bg-white border border-[#c5b597] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8a6d2f] text-gray-900 shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPass ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-lg btn-gold font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin text-base" />
                      <span>{isTamil ? 'மாற்றப்படுகிறது...' : 'Updating Password...'}</span>
                    </>
                  ) : (
                    <>
                      <FaKey className="text-xs" />
                      <span>{isTamil ? 'கடவுச்சொல்லை மாற்றவும்' : 'Update Password'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* ─── STEP 4: Success State ─── */}
          {step === 4 && (
            <div className="py-4 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-400 text-emerald-700 flex items-center justify-center text-3xl mx-auto shadow-inner animate-bounce">
                <FaCheckCircle />
              </div>
              <div>
                <h4 className="font-extrabold text-base sm:text-lg text-[#163828]">
                  {isTamil ? 'கடவுச்சொல் வெற்றிகரமாக மாற்றப்பட்டது! 🎉' : 'Password Changed Successfully! 🎉'}
                </h4>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  {isTamil
                    ? 'உங்கள் புதிய கடவுச்சொல் சேமிக்கப்பட்டது. இப்போது நீங்கள் எளிதாக உள்நுழையலாம்.'
                    : 'Your password has been successfully updated. You can now log in using your new credentials.'}
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onOpenLogin) onOpenLogin(identifier);
                  }}
                  className="w-full py-2.5 rounded-lg btn-gold font-extrabold text-xs sm:text-sm shadow-md transition cursor-pointer"
                >
                  {isTamil ? 'இப்போது உள்நுழைக (Login Now)' : 'Login Now'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
