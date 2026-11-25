import React, { useState, useEffect } from 'react';
import {
  FaTimes,
  FaCrown,
  FaCheckCircle,
  FaBolt,
  FaStar,
  FaShieldAlt,
  FaQrcode,
  FaUpload,
  FaTrash,
  FaDownload,
  FaClock,
} from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';
import { useModalBackdrop } from '../hooks/useModalBackdrop';
import DefaultAvatar from './DefaultAvatar';

export default function FeatureProfileModal({
  isOpen,
  onClose,
  currentUser,
  onOpenLogin,
  onSuccess,
  marqueeSettings,
}) {
  const { t, isTamil, translateName } = useLanguage();
  const { backdropProps, modalContentProps } = useModalBackdrop(onClose);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [price, setPrice] = useState(marqueeSettings?.price || 299);
  const [durationDays, setDurationDays] = useState(marqueeSettings?.durationDays || 15);

  // Manual QR & Proof Upload State
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [transactionId, setTransactionId] = useState('');
  const [notes, setNotes] = useState('');
  const [submittedSuccessfully, setSubmittedSuccessfully] = useState(false);
  const [existingPendingProof, setExistingPendingProof] = useState(null);
  const [showNewUploadForm, setShowNewUploadForm] = useState(false);

  const isAlreadyFeatured = Boolean(
    currentUser &&
    currentUser.isFeatured &&
    (!currentUser.featuredUntil || new Date(currentUser.featuredUntil) > new Date())
  );

  useEffect(() => {
    if (marqueeSettings?.price) setPrice(marqueeSettings.price);
    if (marqueeSettings?.durationDays) setDurationDays(marqueeSettings.durationDays);
  }, [marqueeSettings]);

  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      setSuccessMsg('');
      setScreenshotFile(null);
      setScreenshotPreview(null);
      setTransactionId('');
      setNotes('');
      setSubmittedSuccessfully(false);
      setShowNewUploadForm(false);

      const token = localStorage.getItem('nikah_token');
      if (token) {
        fetch('/api/payment/my-proofs', {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.success && data.proofs) {
              const pendingMarquee = data.proofs.find(
                (p) =>
                  p.status === 'pending' &&
                  (p.planType === 'featured_marquee' ||
                    p.planName?.toLowerCase().includes('marquee') ||
                    p.planName?.toLowerCase().includes('running bar'))
              );
              setExistingPendingProof(pendingMarquee || null);
            }
          })
          .catch((err) => console.warn('Could not fetch user marquee proofs:', err));
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedMimes.includes(file.mimetype) && !file.type.startsWith('image/')) {
      setErrorMsg(
        isTamil
          ? 'தயவுசெய்து செல்லுபடியாகும் படம் (JPG, PNG, WEBP) அல்லது PDF கோப்பை பதிவேற்றவும்.'
          : 'Please select a valid image (JPG, PNG, WEBP) or PDF file.'
      );
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg(
        isTamil
          ? 'கோப்பு அளவு 10MB-க்கு குறைவாக இருக்க வேண்டும்.'
          : 'File size must be less than 10MB.'
      );
      return;
    }

    setErrorMsg('');
    setScreenshotFile(file);
    if (file.type.startsWith('image/')) {
      setScreenshotPreview(URL.createObjectURL(file));
    } else {
      setScreenshotPreview(null);
    }
  };

  const handleRemoveFile = () => {
    setScreenshotFile(null);
    if (screenshotPreview) {
      URL.revokeObjectURL(screenshotPreview);
      setScreenshotPreview(null);
    }
  };

  const handleSubmitProof = async (e) => {
    e?.preventDefault();

    if (!currentUser) {
      if (onOpenLogin) onOpenLogin();
      onClose();
      return;
    }

    if (!screenshotFile) {
      setErrorMsg(
        isTamil
          ? 'கட்டணம் செலுத்தியதற்கான ஸ்கிரீன்ஷாட் சான்றை பதிவேற்றுவது கட்டாயமாகும்.'
          : 'Payment screenshot proof is mandatory. Please attach your payment screenshot before submitting.'
      );
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const token = localStorage.getItem('nikah_token');
      if (!token) {
        setErrorMsg(
          isTamil
            ? 'சான்றை சமர்ப்பிக்க முதலில் உள்நுழையவும்.'
            : 'Please log in before submitting payment proof.'
        );
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append('screenshot', screenshotFile);
      formData.append('planId', 'featured_marquee');
      formData.append('amount', price);
      if (transactionId.trim()) formData.append('transactionId', transactionId.trim());
      if (notes.trim()) formData.append('notes', notes.trim());

      const res = await fetch('/api/payment/submit-proof', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(
          data.message ||
            (isTamil ? 'சான்று சமர்ப்பிப்பதில் தோல்வி.' : 'Failed to submit payment proof.')
        );
      }

      setSubmittedSuccessfully(true);
      setSuccessMsg(
        isTamil
          ? `அல்ஹம்துலில்லாஹ்! ஓடும் பட்டி விளம்பரத்திற்கான ₹${price} கட்டண சான்று வெற்றிகரமாக பெறப்பட்டது. நிர்வாகி சரிபார்த்தவுடன் உங்கள் வரன் உடனடியாக ஓடும் பட்டியில் காட்சிப்படுத்தப்படும்.`
          : `Alhamdulillah! Your payment proof of ₹${price} to feature your profile in the Running Marquee Bar has been submitted. Admin will verify and activate it shortly.`
      );

      if (onSuccess) onSuccess(data);
    } catch (err) {
      console.error('[Submit Marquee Proof Error]:', err);
      setErrorMsg(
        err.message ||
          (isTamil
            ? 'கட்டண சான்றை சமர்ப்பிப்பதில் பிழை.'
            : 'An error occurred while submitting payment proof.')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
      {...backdropProps}
    >
      <div
        className="w-full max-w-lg bg-[#faf7ef] border-2 border-[#caa85d] rounded-2xl shadow-2xl overflow-hidden relative max-h-[94vh] flex flex-col"
        {...modalContentProps}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#163828] via-[#21543c] to-[#163828] text-white p-4 flex items-center justify-between border-b-2 border-[#caa85d] flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-200 text-[#163828] flex items-center justify-center font-bold text-lg shadow-sm">
              <FaStar className="text-amber-700" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-amber-100 flex items-center gap-1.5 font-cinzel">
                <span>{isTamil ? 'ஓடும் பட்டியில் முன்னிலைப்படுத்த' : 'Feature in Top Running Marquee'}</span>
              </h3>
              <p className="text-[11px] text-amber-200/80">
                {isTamil ? `${durationDays} நாட்கள் பிரத்யேக காட்சி முன்னுரிமை` : `${durationDays} Days Top Priority Visibility`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg transition cursor-pointer text-base"
          >
            <FaTimes />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 space-y-4 text-gray-800 overflow-y-auto">
          {/* Already Featured Notice */}
          {isAlreadyFeatured && (
            <div className="p-3.5 bg-emerald-50 border-2 border-emerald-500 rounded-xl flex items-start gap-3 text-emerald-950 shadow-sm">
              <FaCheckCircle className="text-emerald-600 text-xl flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-extrabold text-sm text-emerald-900">
                  {isTamil ? '✓ ஏற்கனவே ஓடும் பட்டியில் காட்சிப்படுத்தப்பட்டுள்ளது!' : '✓ Already Featured & Active'}
                </h4>
                <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
                  {isTamil
                    ? 'உங்கள் வரன் ஏற்கனவே முகப்பு ஓடும் பட்டியில் முன்னிலைப்படுத்தப்பட்டு நேரலையில் உள்ளது.'
                    : 'Your profile is currently active in the top running marquee bar.'}
                </p>
                {currentUser?.featuredUntil && (
                  <p className="text-[11px] font-bold text-emerald-900 mt-1">
                    {isTamil ? 'செல்லுபடியாகும் காலம்:' : 'Active until:'}{' '}
                    {new Date(currentUser.featuredUntil).toLocaleDateString(isTamil ? 'ta-IN' : 'en-IN', {
                      dateStyle: 'medium',
                    })}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Pending Proof Notice */}
          {existingPendingProof && !submittedSuccessfully && !showNewUploadForm && (
            <div className="p-4 bg-amber-50 border-2 border-amber-400 rounded-xl space-y-2">
              <div className="flex items-start gap-2.5">
                <FaClock className="text-amber-600 text-lg flex-shrink-0 mt-0.5 animate-pulse" />
                <div className="flex-1">
                  <h4 className="font-bold text-xs sm:text-sm text-amber-950">
                    {isTamil
                      ? '⏳ விளம்பர கட்டண சான்று பரிசீலனையில் உள்ளது'
                      : '⏳ Promotion Payment Proof Under Verification'}
                  </h4>
                  <p className="text-xs text-amber-900 mt-0.5 leading-relaxed">
                    {isTamil
                      ? `ஓடும் பட்டியில் வரனை முன்னிலைப்படுத்த சமர்ப்பிக்கப்பட்ட ₹${price} கட்டண சான்று நிர்வாகியால் சரிபார்க்கப்பட்டு வருகிறது. சரிபார்த்ததும் உங்கள் வரன் முகப்பு பட்டியில் தோன்றும்.`
                      : `Your ₹${price} payment proof to feature profile in the running marquee is under review. It will be enabled upon admin verification.`}
                  </p>
                  {existingPendingProof.createdAt && (
                    <p className="text-[11px] text-amber-800 font-mono mt-1">
                      {isTamil ? 'சமர்ப்பிக்கப்பட்ட நேரம்:' : 'Submitted on:'}{' '}
                      {new Date(existingPendingProof.createdAt).toLocaleString(isTamil ? 'ta-IN' : 'en-IN')}
                    </p>
                  )}
                </div>
              </div>
              <div className="pt-1 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setShowNewUploadForm(true)}
                  className="text-xs font-bold text-amber-900 hover:text-amber-950 underline cursor-pointer"
                >
                  {isTamil ? '+ புதிய கட்டண சான்று சமர்ப்பிக்க' : '+ Submit a New Proof'}
                </button>
              </div>
            </div>
          )}

          {/* Submission Success Screen */}
          {submittedSuccessfully ? (
            <div className="p-5 bg-emerald-50 border-2 border-emerald-500 rounded-2xl text-center space-y-3.5 shadow-md">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-600 text-white flex items-center justify-center text-2xl shadow-lg">
                <FaCheckCircle />
              </div>
              <h4 className="font-extrabold text-base sm:text-lg text-emerald-950 font-cinzel">
                {isTamil ? 'அல்ஹம்துலில்லாஹ்! கட்டண சான்று பெறப்பட்டது' : 'Alhamdulillah! Payment Proof Received'}
              </h4>
              <p className="text-xs sm:text-sm text-emerald-900 leading-relaxed max-w-md mx-auto">
                {successMsg}
              </p>
              <div className="p-3 bg-white/80 rounded-xl border border-emerald-300 text-xs text-emerald-950 font-medium inline-block">
                <span>{isTamil ? 'நிர்வாகி சரிபார்ப்பு நிலை: ' : 'Admin Status: '}</span>
                <span className="font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                  {isTamil ? 'பரிசீலனையில் (Pending)' : 'Under Review'}
                </span>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#163828] to-[#24583f] text-[#edd48e] font-black text-xs sm:text-sm shadow hover:brightness-110 cursor-pointer"
                >
                  {isTamil ? 'சரி (மூடுக)' : 'Done (Close)'}
                </button>
              </div>
            </div>
          ) : (!existingPendingProof || showNewUploadForm) && !isAlreadyFeatured ? (
            <>
              {/* User Profile Card Preview */}
              {currentUser ? (
                <div className="p-3 bg-white rounded-xl border border-[#dfd2ba] flex items-center gap-3 shadow-xs">
                  <div className="w-12 h-14 rounded-lg overflow-hidden border border-amber-300 flex-shrink-0 bg-gray-100">
                    {currentUser.photos?.[0] ? (
                      <img
                        src={currentUser.photos[0]}
                        alt={currentUser.fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <DefaultAvatar size="card" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-xs text-[#163828] truncate">
                        {translateName(
                          !isTamil
                            ? currentUser.fullNameEn || currentUser.fullName || currentUser.name
                            : currentUser.fullName || currentUser.name
                        )}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-200">
                        {currentUser.nikahId}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      {currentUser.district || currentUser.location} • {currentUser.age}{' '}
                      {isTamil ? 'வயது' : 'Yrs'}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-bold mt-1">
                      <FaBolt className="text-[9px]" />
                      <span>
                        {isTamil ? 'முகப்பு உச்சியில் ஓடிக்கொண்டிருக்கும்' : 'Runs live at top of homepage'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-center text-xs text-amber-900">
                  {isTamil
                    ? 'வரனை விளம்பரப்படுத்த முதலில் உள்நுழையவும்.'
                    : 'Please log in to promote your profile.'}
                </div>
              )}

              {/* Benefits */}
              <div className="space-y-1.5 bg-[#fdfaf3] p-3 rounded-xl border border-[#caa85d]/60 text-xs">
                <h4 className="font-extrabold text-[#163828] text-xs flex items-center gap-1.5 uppercase tracking-wider">
                  <FaCrown className="text-amber-600" />
                  <span>{isTamil ? 'ஓடும் பட்டியின் நன்மைகள்:' : 'Marquee Promotion Benefits:'}</span>
                </h4>
                <ul className="space-y-1 text-gray-700 text-[11px]">
                  <li className="flex items-start gap-1.5">
                    <FaCheckCircle className="text-emerald-700 text-xs flex-shrink-0 mt-0.5" />
                    <span>
                      {isTamil
                        ? 'வலைதள முகப்பின் உச்சியில் உங்கள் வரன் தொடர்ந்து ஓடிக்கொண்டிருக்கும்.'
                        : 'Your biodata continuously scrolls across the top banner of the website.'}
                    </span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <FaCheckCircle className="text-emerald-700 text-xs flex-shrink-0 mt-0.5" />
                    <span>
                      {isTamil
                        ? '10 மடங்கு கூடுதல் பார்வையாளர்களை ஈர்க்கும் பிரத்யேக தங்க நட்சத்திர அடையாளம்.'
                        : 'Attracts up to 10x more prospective inquiries with featured badge.'}
                    </span>
                  </li>
                </ul>
              </div>

              {/* UPI QR Payment Card */}
              <div className="bg-gradient-to-b from-[#fffef9] to-[#f7f0df] border-2 border-[#caa85d] rounded-2xl p-4 shadow-sm space-y-3 text-center">
                <div className="flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider text-[#163828]">
                  <FaQrcode className="text-base text-[#8a6d2f]" />
                  <span>{isTamil ? 'UPI QR குறியீட்டை ஸ்கேன் செய்து செலுத்தவும்' : 'Scan UPI QR Code to Pay'}</span>
                </div>

                {/* Amount Highlight */}
                <div className="bg-gradient-to-r from-amber-500/20 via-amber-400/30 to-amber-500/20 border border-amber-400/60 rounded-xl py-2 px-3 inline-block">
                  <span className="text-[11px] text-gray-700 font-bold uppercase tracking-wider mr-2">
                    {isTamil ? 'விளம்பரக் கட்டணம்:' : 'Promotion Fee:'}
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-[#163828]">
                    ₹{price}
                  </span>
                  <span className="text-[11px] text-gray-600 block mt-0.5">
                    ({durationDays} {isTamil ? 'நாட்கள் செல்லுபடியாகும்' : 'Days Validity'})
                  </span>
                </div>

                {/* The QR Image */}
                <div className="flex flex-col items-center justify-center pt-1">
                  <div className="p-2.5 bg-white border-2 border-[#caa85d] rounded-2xl shadow-md inline-block relative group">
                    <img
                      src="/payment_qr.jpg"
                      alt="UPI Payment QR Code"
                      className="w-44 h-44 sm:w-48 sm:h-48 object-contain rounded-lg"
                      loading="eager"
                    />
                    <div className="mt-1.5 flex items-center justify-center gap-2">
                      <a
                        href="/payment_qr.jpg"
                        download="TamilMuslimNikkah_Payment_QR.jpg"
                        className="text-[11px] font-bold text-[#163828] hover:text-[#8a6d2f] flex items-center gap-1 bg-amber-100/70 hover:bg-amber-200/80 px-2 py-0.5 rounded-md transition"
                        title={isTamil ? 'QR குறியீட்டை பதிவிறக்குக' : 'Download QR Image'}
                      >
                        <FaDownload className="text-[10px]" />
                        <span>{isTamil ? 'QR பதிவிறக்குக' : 'Download QR'}</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                <div className="text-xs text-gray-700 space-y-0.5 pt-1">
                  <p className="font-extrabold text-[#163828]">
                    {isTamil
                      ? 'GPay, PhonePe, Paytm அல்லது எந்த UPI செயலி மூலமும் ஸ்கேன் செய்து ₹' + price + ' செலுத்தவும்.'
                      : `Scan using GPay, PhonePe, Paytm or any UPI app and pay ₹${price}.`}
                  </p>
                  <p className="text-[11px] text-gray-600">
                    {isTamil
                      ? 'கட்டணம் செலுத்திய பிறகு வரும் திரையை (Screenshot) புகைப்படம் எடுத்து கீழே பதிவேற்றவும்.'
                      : 'Take a screenshot of the completed payment and upload it below.'}
                  </p>
                </div>
              </div>

              {/* Mandatory Screenshot Proof Upload */}
              <div className="bg-white border-2 border-[#caa85d]/80 rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-[#163828] uppercase tracking-wider flex items-center gap-1.5">
                    <FaUpload className="text-[#8a6d2f]" />
                    <span>
                      {isTamil
                        ? 'கட்டண ஸ்கிரீன்ஷாட் சான்றை பதிவேற்றவும் (கட்டாயம்)'
                        : 'Upload Payment Screenshot Proof (Mandatory)'}
                    </span>
                    <span className="text-red-600 font-bold">*</span>
                  </label>
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300">
                    {isTamil ? 'கட்டாய சான்று' : 'Required'}
                  </span>
                </div>

                {/* Upload Box */}
                {!screenshotFile ? (
                  <label className="border-2 border-dashed border-[#caa85d] hover:border-[#163828] bg-[#fbf9f3] hover:bg-[#f6efe1] rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition text-center">
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <div className="w-10 h-10 rounded-full bg-amber-100 text-[#8a6d2f] flex items-center justify-center text-base shadow-xs">
                      <FaUpload />
                    </div>
                    <div>
                      <p className="font-extrabold text-xs text-[#163828]">
                        {isTamil
                          ? 'இங்கே கிளிக் செய்து ஸ்கிரீன்ஷாட்டைத் தேர்ந்தெடுக்கவும்'
                          : 'Click to select payment screenshot'}
                      </p>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        {isTamil
                          ? 'JPG, PNG, WEBP அல்லது PDF (அதிகபட்சம் 10MB)'
                          : 'Supports JPG, PNG, WEBP or PDF (Max 10MB)'}
                      </p>
                    </div>
                  </label>
                ) : (
                  <div className="p-3 bg-emerald-50 border-2 border-emerald-400 rounded-xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {screenshotPreview ? (
                        <img
                          src={screenshotPreview}
                          alt="Screenshot Preview"
                          className="w-14 h-14 object-cover rounded-lg border border-emerald-300 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-emerald-200 text-emerald-800 flex items-center justify-center font-bold text-xs flex-shrink-0">
                          PDF DOC
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <FaCheckCircle className="text-emerald-600 text-xs flex-shrink-0" />
                          <p className="font-extrabold text-xs text-emerald-950 truncate">
                            {screenshotFile.name}
                          </p>
                        </div>
                        <p className="text-[11px] text-emerald-800 mt-0.5">
                          {(screenshotFile.size / 1024).toFixed(1)} KB •{' '}
                          <span className="font-bold text-emerald-700">
                            {isTamil ? 'சான்று இணைக்கப்பட்டது' : 'Proof Attached'}
                          </span>
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition cursor-pointer"
                      title={isTamil ? 'நீக்குக' : 'Remove'}
                    >
                      <FaTrash className="text-sm" />
                    </button>
                  </div>
                )}

                {/* Optional UTR / Reference ID Field */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      {isTamil ? 'UPI பரிவர்த்தனை எண் / UTR (விருப்பத்தேர்வு):' : 'UPI Ref / UTR No. (Optional):'}
                    </label>
                    <input
                      type="text"
                      placeholder={isTamil ? 'எ.கா: 4289XXXXXXXX' : 'e.g., 4289XXXXXXXX'}
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#caa85d] bg-[#fbf9f3] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#163828]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      {isTamil ? 'கூடுதல் குறிப்பு (விருப்பத்தேர்வு):' : 'Additional Notes (Optional):'}
                    </label>
                    <input
                      type="text"
                      placeholder={isTamil ? 'எ.கா: Google Pay மூலம் செலுத்தினேன்' : 'e.g., Paid via Google Pay'}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#caa85d] bg-[#fbf9f3] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#163828]"
                    />
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-300 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Submit CTA */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleSubmitProof}
                  disabled={loading || !screenshotFile || !currentUser}
                  className={`w-full py-3 px-4 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                    !screenshotFile || !currentUser
                      ? 'bg-gray-200 text-gray-500 border border-gray-300 cursor-not-allowed'
                      : 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-gray-950 border border-amber-300 hover:scale-[1.01] active:scale-98'
                  }`}
                >
                  <FaCrown className={screenshotFile ? 'text-[#163828]' : 'text-gray-400'} />
                  <span>
                    {loading
                      ? (isTamil ? 'சான்று பதிவேற்றப்படுகிறது...' : 'Uploading Payment Proof...')
                      : !screenshotFile
                      ? (isTamil ? 'ஸ்கிரீன்ஷாட்டை பதிவேற்றவும் (கட்டாயம்)' : 'Upload Screenshot to Proceed')
                      : (isTamil
                          ? `₹${price} விளம்பர கட்டண சான்றை சமர்ப்பிக்கவும்`
                          : `Submit Proof to Feature Profile (₹${price})`)}
                  </span>
                </button>
                <p className="text-[10px] text-center text-gray-500 mt-2 flex items-center justify-center gap-1">
                  <FaShieldAlt className="text-emerald-700" />
                  <span>
                    {isTamil
                      ? 'நிர்வாகியால் சான்று சரிபார்க்கப்பட்டு உங்கள் வரன் முகப்பு ஓடும் பட்டியில் காட்சிப்படுத்தப்படும்.'
                      : 'Admin verifies the screenshot and features your profile in the marquee bar.'}
                  </span>
                </p>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
