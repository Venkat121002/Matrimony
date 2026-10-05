import React, { useState, useEffect, useRef } from 'react';
import {
  FaTimes,
  FaUserPlus,
  FaCheckCircle,
  FaPlus,
  FaTrash,
  FaMicrophone,
  FaCamera,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaInfoCircle,
  FaFileAudio,
  FaUserTie,
  FaPhoneAlt,
  FaGraduationCap,
  FaLanguage,
  FaExclamationTriangle,
} from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';
import TamilInput from './TamilInput';
import LiveAudioRecorder from './LiveAudioRecorder';
import { TAMIL_NADU_DISTRICTS, DISTRICT_MAP } from '../data/districts';
import { transliterateSentence } from '../utils/tamilTransliterate';

export default function RegisterModal({
  isOpen,
  onClose,
  onRegisterSuccess,
  onOpenLogin,
}) {
  const { isTamil } = useLanguage();

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [popupAlert, setPopupAlert] = useState(null); // Pop up alert for errors / missing inputs
  const formRef = useRef(null);
  const mouseDownTargetRef = useRef(null);

  const handleBackdropMouseDown = (e) => {
    mouseDownTargetRef.current = e.target;
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && mouseDownTargetRef.current === e.currentTarget) {
      onClose();
    }
  };

  // Helper to trigger alert pop-up above form
  const showPopupAlert = (title, message, type = 'error', targetField = '') => {
    setPopupAlert({ title, message, type, targetField });
    setErrorMsg(message);
    if (formRef.current) {
      formRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDismissAlert = (targetField) => {
    setPopupAlert(null);
    if (targetField) {
      setTimeout(() => {
        const el =
          document.getElementById(`reg-${targetField}`) ||
          document.getElementsByName(targetField)[0];
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          if (typeof el.focus === 'function') el.focus();
        }
      }, 150);
    }
  };

  // Form State
  const [formData, setFormData] = useState({
    // Gender
    gender: 'groom', // 'groom' | 'bride'

    // Name (Tamil and English)
    name: '',
    nameEn: '',

    // Mobile Numbers
    phone: '',
    additionalPhones: [''], // Option to add multiple mobile numbers

    // Email Address (Optional)
    email: '',

    // Password
    password: '',

    // Age
    age: '26',

    // Education
    education: 'B.E / B.Tech',

    // Marital Status (Un married, Divorced, Applied for divorce, Bereaved of a partner, Additional Marriage)
    maritalStatus: 'Un married',

    // Location
    location: 'Chennai',

    // Language (Tamil-Muslim, Urdu-Muslim, Tamil-Urdu Muslim, Kerala-Muslim)
    language: 'Tamil-Muslim',

    // Occupation
    occupation: '',

    // Workplace
    workplace: '',

    // Monthly Income
    income: '',

    // Height
    height: '5.6 அடி (5\'6")',

    // Properties
    properties: '',

    // Description (Limited to two lines)
    description: '',

    // Publisher details (The one who actually registering)
    publisherName: '',
    publisherRelationship: 'Self',

    // Declaration checkbox
    declarationAgreed: false,
  });

  // Media files state
  const [photos, setPhotos] = useState([]); // Up to 3 files
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [audioFile, setAudioFile] = useState(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState('');

  const photoInputRef = useRef(null);
  const audioInputRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Clean up object URLs when unmounted or changed
  useEffect(() => {
    return () => {
      photoPreviews.forEach((url) => URL.revokeObjectURL(url));
      if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl);
    };
  }, [photoPreviews, audioPreviewUrl]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // English name input handler: strictly English characters (no Tamil script)
  const handleEnglishNameChange = (e) => {
    const val = e.target.value.replace(/[\u0B80-\u0BFF]/g, '');
    setFormData((prev) => ({
      ...prev,
      nameEn: val,
    }));
  };

  // Multiple phone numbers handlers
  const handleAdditionalPhoneChange = (index, value) => {
    const updated = [...formData.additionalPhones];
    updated[index] = value;
    setFormData((prev) => ({ ...prev, additionalPhones: updated }));
  };

  const handleAddPhoneField = () => {
    if (formData.additionalPhones.length < 4) {
      setFormData((prev) => ({
        ...prev,
        additionalPhones: [...prev.additionalPhones, ''],
      }));
    }
  };

  const handleRemovePhoneField = (index) => {
    const updated = formData.additionalPhones.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, additionalPhones: updated }));
  };

  // Photos handling (Max up to 5)
  const handlePhotoSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const availableSlots = 5 - photos.length;
    if (availableSlots <= 0) {
      alert(isTamil ? 'அதிகபட்சம் 5 புகைப்படங்கள் மட்டுமே பதிவேற்ற முடியும்.' : 'Maximum 5 photos can be uploaded.');
      return;
    }

    const selectedFiles = files.slice(0, availableSlots);
    const validFiles = [];
    const newPreviews = [];

    for (const file of selectedFiles) {
      if (!file.type.startsWith('image/')) {
        alert(isTamil ? 'புகைப்படங்களை மட்டுமே பதிவேற்ற முடியும்.' : 'Please select image files only.');
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert(isTamil ? 'புகைப்படம் ஒவ்வொன்றும் 5MB-க்குள் இருக்க வேண்டும்.' : 'Each photo must be under 5MB.');
        continue;
      }
      validFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    }

    setPhotos((prev) => [...prev, ...validFiles]);
    setPhotoPreviews((prev) => [...prev, ...newPreviews]);

    if (photoInputRef.current) photoInputRef.current.value = '';
  };

  const handleRemovePhoto = (index) => {
    URL.revokeObjectURL(photoPreviews[index]);
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Audio Clip handling (Optional)
  const handleAudioSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/') && !file.name.match(/\.(mp3|wav|m4a|aac|ogg)$/i)) {
      alert(isTamil ? 'சரியான ஆடியோ கோப்பை (MP3, WAV, M4A) தேர்வு செய்யவும்.' : 'Please select a valid audio file (MP3, WAV, M4A).');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      alert(isTamil ? 'ஆடியோ கோப்பு 15MB-க்குள் இருக்க வேண்டும்.' : 'Audio file must be under 15MB.');
      return;
    }

    if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl);

    setAudioFile(file);
    setAudioPreviewUrl(URL.createObjectURL(file));
    if (audioInputRef.current) audioInputRef.current.value = '';
  };

  const handleRemoveAudio = () => {
    if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl);
    setAudioFile(null);
    setAudioPreviewUrl('');
  };

  // Validation with prominent pop-up alerts
  const validateForm = () => {
    setErrorMsg('');

    if (!formData.name.trim()) {
      showPopupAlert(
        isTamil ? 'தமிழில் பெயர் விடுபட்டுள்ளது!' : 'Candidate Name in Tamil Missing!',
        isTamil ? 'வரனின் பெயரை தமிழில் உள்ளிடுவது கட்டாயமாகும்.' : 'Candidate Name in Tamil is required.',
        'error',
        'name'
      );
      return false;
    }

    if (!formData.nameEn.trim()) {
      showPopupAlert(
        isTamil ? 'ஆங்கிலத்தில் பெயர் விடுபட்டுள்ளது!' : 'Candidate Name in English Missing!',
        isTamil ? 'வரனின் பெயரை ஆங்கிலத்தில் உள்ளிடுவது கட்டாயமாகும்.' : 'Candidate Name in English is required.',
        'error',
        'nameEn'
      );
      return false;
    }

    const cleanP = formData.phone.trim().replace(/\D/g, '');
    if (!formData.phone.trim() || cleanP.length < 10) {
      showPopupAlert(
        isTamil ? 'மொபைல் எண் விடுபட்டுள்ளது!' : 'Valid Mobile Number Required!',
        isTamil ? 'சரியான 10 இலக்க மொபைல் எண்ணை உள்ளிடவும்.' : 'Please enter a valid 10-digit mobile number.',
        'error',
        'phone'
      );
      return false;
    }

    if (!formData.password || formData.password.length < 6) {
      showPopupAlert(
        isTamil ? 'கடவுச்சொல் தேவை!' : 'Password Required!',
        isTamil ? 'கடவுச்சொல் குறைந்தது 6 எழுத்துகள் இருக்க வேண்டும்.' : 'Password must be at least 6 characters.',
        'error',
        'password'
      );
      return false;
    }

    if (!formData.age || Number(formData.age) < 18) {
      showPopupAlert(
        isTamil ? 'வயது சரிபார்க்கவும்!' : 'Check Age!',
        isTamil ? 'வயது 18 அல்லது அதற்கு மேல் இருக்க வேண்டும்.' : 'Age must be 18 or above.',
        'error',
        'age'
      );
      return false;
    }

    if (!formData.publisherName.trim()) {
      showPopupAlert(
        isTamil ? 'பதிவு செய்பவர் பெயர் தேவை!' : 'Publisher Name Required!',
        isTamil ? 'பதிவு செய்பவரின் பெயரை (Publisher Name) உள்ளிடவும்.' : 'Please enter the Publisher Name.',
        'error',
        'publisherName'
      );
      return false;
    }

    if (!formData.declarationAgreed) {
      showPopupAlert(
        isTamil ? 'உறுதிமொழி தேவை!' : 'Declaration Required!',
        isTamil ? 'பதிவை சமர்ப்பிக்க கீழே உள்ள உறுதிமொழியை டிக் செய்யவும்.' : 'Please accept the declaration to proceed with registration.',
        'warning',
        'declaration'
      );
      return false;
    }

    return true;
  };

  // Single-Page Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setErrorMsg('');

    try {
      const payload = new FormData();
      // Ensure Tamil name is authentic Tamil script
      let rawTa = (formData.name || '').trim();
      if (/[a-zA-Z]/.test(rawTa)) {
        rawTa = transliterateSentence(rawTa);
      }
      // Ensure English name is strictly English
      const rawEn = (formData.nameEn || '').replace(/[\u0B80-\u0BFF]/g, '').trim();

      payload.append('gender', formData.gender);
      payload.append('name', rawTa);
      payload.append('fullName', rawTa);
      payload.append('nameEn', rawEn);
      payload.append('fullNameEn', rawEn);
      payload.append('phone', formData.phone.trim());

      // Filter and append additional phones
      const validAdditionalPhones = formData.additionalPhones
        .map((p) => p.trim())
        .filter((p) => p.length > 0);
      if (validAdditionalPhones.length > 0) {
        payload.append('additionalPhones', JSON.stringify(validAdditionalPhones));
      }

      // Optional email
      if (formData.email && formData.email.trim()) {
        payload.append('email', formData.email.trim().toLowerCase());
      }

      payload.append('password', formData.password);
      payload.append('age', formData.age);
      payload.append('education', formData.education.trim());
      payload.append('maritalStatus', formData.maritalStatus);
      payload.append('location', formData.location.trim());
      payload.append('district', formData.location.trim());
      payload.append('language', formData.language);
      payload.append('occupation', formData.occupation.trim());
      payload.append('workplace', formData.workplace.trim());
      payload.append('income', formData.income.trim());
      payload.append('monthlyIncome', formData.income.trim());
      payload.append('height', formData.height.trim());
      payload.append('properties', formData.properties.trim());
      payload.append('description', formData.description.trim());
      payload.append('bio', formData.description.trim());

      // Publisher
      payload.append('publisherName', formData.publisherName.trim());
      payload.append('publisherRelationship', formData.publisherRelationship);

      // Declaration
      payload.append('declarationAgreed', 'true');

      // Photos (up to 3)
      photos.forEach((photo) => {
        payload.append('photos', photo);
      });

      // Audio Clip (optional)
      if (audioFile) {
        payload.append('audioClip', audioFile);
      }

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        body: payload,
      });

      const data = await res.json();

      if (data.success) {
        // DO NOT auto login. Simply close registration and trigger success pop up!
        onRegisterSuccess(data.user);
        onClose();
      } else {
        const msg = data.message || 'Registration failed. Please check your inputs.';
        const isDuplicate =
          msg.toLowerCase().includes('already exists') ||
          msg.toLowerCase().includes('mobile number');

        showPopupAlert(
          isDuplicate
            ? (isTamil ? 'மொபைல் எண் ஏற்கனவே உள்ளது!' : 'Mobile Number Already Exists!')
            : (isTamil ? 'பதிவு பிழை' : 'Registration Alert'),
          isDuplicate
            ? (isTamil
              ? 'இந்த மொபைல் எண் ஏற்கனவே பதிவு செய்யப்பட்டுள்ளது. நீங்கள் ஏற்கனவே கணக்கு வைத்திருந்தால் தயவுசெய்து உள்நுழையவும்.'
              : 'An account with this mobile number already exists. If you have an account, please log in.')
            : msg,
          isDuplicate ? 'exists' : 'error',
          'phone'
        );
      }
    } catch (err) {
      console.error('[Registration Request Error]:', err);
      showPopupAlert(
        isTamil ? 'இணைப்பு பிழை' : 'Connection Error',
        isTamil
          ? 'பதிவு செய்வதில் பிழை ஏற்பட்டது. இணைய இணைப்பை சரிபார்த்து மீண்டும் முயற்சிக்கவும்.'
          : 'Failed to complete registration. Please check connection and try again.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-sm overflow-y-auto animate-fadeIn"
      onMouseDown={handleBackdropMouseDown}
      onClick={handleBackdropClick}
    >
      <div
        className="w-full max-w-3xl bg-[#faf7ef] border-2 border-[#caa85d] rounded-2xl shadow-2xl overflow-hidden relative my-4 max-h-[94vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#163828] via-[#24583f] to-[#163828] py-3.5 px-5 flex items-center justify-between border-b-2 border-[#caa85d] text-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-[#163828] shadow-md flex-shrink-0">
              <FaUserPlus className="text-lg" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-xl text-[#fffae6] tracking-wide font-cinzel">
                {isTamil ? 'ஒற்றைப் பக்க புதிய வரன் பதிவு' : 'NEW REGISTRATION FORM'}
              </h3>
              <p className="text-[11px] sm:text-xs text-[#edd48e]">
                {isTamil
                  ? ''
                  : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 text-lg transition"
            aria-label="Close"
          >
            <FaTimes />
          </button>
        </div>

        {/* Floating Error & Validation Pop-up Modal (Displayed prominently above form) */}
        {popupAlert && (
          <div
            className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
            onClick={() => handleDismissAlert(popupAlert.targetField)}
          >
            <div
              className="w-full max-w-md bg-[#faf7ef] border-2 border-red-500 rounded-2xl shadow-2xl overflow-hidden relative animate-scaleUp"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-red-800 via-red-700 to-red-800 py-3.5 px-5 flex items-center justify-between text-white border-b-2 border-amber-400">
                <div className="flex items-center gap-2.5">
                  <FaExclamationTriangle className="text-amber-300 text-lg flex-shrink-0 animate-bounce" />
                  <h4 className="font-extrabold text-sm sm:text-base tracking-wide font-cinzel text-amber-100">
                    {popupAlert.title}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => handleDismissAlert(popupAlert.targetField)}
                  className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/20 transition"
                  aria-label="Close"
                >
                  <FaTimes />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 text-red-900 text-xs sm:text-sm font-semibold leading-relaxed">
                  {popupAlert.message}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-1">
                  {popupAlert.type === 'exists' && onOpenLogin && (
                    <button
                      type="button"
                      onClick={() => {
                        const phoneToLogin = formData.phone;
                        setPopupAlert(null);
                        onClose();
                        onOpenLogin(phoneToLogin);
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-[#163828] to-[#21543c] hover:from-[#1b4330] hover:to-[#276447] text-[#ecd08c] font-bold text-xs sm:text-sm rounded-lg border border-[#caa85d] shadow transition"
                    >
                      {isTamil ? 'உள்நுழைய செல்லவும்' : 'Go to Login'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDismissAlert(popupAlert.targetField)}
                    className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm rounded-lg shadow transition"
                  >
                    {popupAlert.type === 'exists'
                      ? (isTamil ? 'எண்ணை மாற்றவும்' : 'Change Number')
                      : (isTamil ? 'சரி, பூர்த்தி செய்கிறேன்' : 'OK, Understood')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Scrollable Single Page Form Body */}
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          noValidate
          className="overflow-y-auto p-4 sm:p-6 flex-grow space-y-6 text-xs sm:text-sm custom-scrollbar"
        >
          {errorMsg && (
            <div className="p-3 bg-red-100 border-l-4 border-red-600 text-red-800 rounded-md text-xs sm:text-sm font-semibold flex items-center gap-2">
              <FaInfoCircle className="text-red-600 flex-shrink-0 text-base" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. GENDER / PROFILE FOR (Bride or Groom) */}
          <div className="bg-white p-4 rounded-xl border border-[#c5b597]/70 shadow-sm space-y-2.5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <label className="text-xs sm:text-sm font-extrabold text-[#163828] flex items-center gap-2">
                <span>{isTamil ? 'வரன் வகை (Gender / Profile For) *' : 'Profile For (Groom or Bride) *'}</span>
              </label>
              <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                {isTamil ? 'தேர்வு செய்யவும்' : 'Select One'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <label
                className={`flex items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition text-center ${formData.gender === 'groom'
                  ? 'bg-[#163828] text-amber-300 border-[#caa85d] shadow-md font-extrabold'
                  : 'bg-[#faf8f4] text-gray-700 border-gray-200 hover:border-gray-300 font-semibold'
                  }`}
              >
                <input
                  type="radio"
                  name="gender"
                  value="groom"
                  checked={formData.gender === 'groom'}
                  onChange={handleChange}
                  className="hidden"
                />
                <span className="text-xs sm:text-sm font-bold tracking-wide">
                  {isTamil ? 'மணமகன் (Groom)' : 'Groom (Male)'}
                </span>
              </label>

              <label
                className={`flex items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition text-center ${formData.gender === 'bride'
                  ? 'bg-[#163828] text-amber-300 border-[#caa85d] shadow-md font-extrabold'
                  : 'bg-[#faf8f4] text-gray-700 border-gray-200 hover:border-gray-300 font-semibold'
                  }`}
              >
                <input
                  type="radio"
                  name="gender"
                  value="bride"
                  checked={formData.gender === 'bride'}
                  onChange={handleChange}
                  className="hidden"
                />
                <span className="text-xs sm:text-sm font-bold tracking-wide">
                  {isTamil ? 'மணமகள் (Bride)' : 'Bride (Female)'}
                </span>
              </label>
            </div>
          </div>

          {/* 2. NAME & PUBLISHER DETAILS */}
          <div className="bg-white p-4 rounded-xl border border-[#c5b597]/70 shadow-sm space-y-4">
            <h4 className="font-extrabold text-xs sm:text-sm text-[#163828] border-b border-gray-100 pb-2 flex items-center gap-2">
              <FaUserTie className="text-[#8a6d2f]" />
              <span>{isTamil ? 'பெயர் மற்றும் தொடர்பாளர் விவரங்கள்' : 'Candidate & Publisher Details'}</span>
            </h4>

            {/* Candidate Names: Separate Tamil and English Dual Fields */}
            <div className="bg-[#faf8f3] p-3.5 rounded-xl border border-[#e5dcce] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-[#745821] flex items-center gap-1.5">
                  <FaLanguage className="text-sm" />
                  {isTamil
                    ? formData.gender === 'bride'
                      ? 'மணமகள் பெயர் (தமிழ் & ஆங்கிலம்)'
                      : 'மணமகன் பெயர் (தமிழ் & ஆங்கிலம்)'
                    : formData.gender === 'bride'
                      ? 'Candidate Name (Tamil & English)'
                      : 'Candidate Name (Tamil & English)'}
                </span>
                <span className="text-[10px] sm:text-[11px] font-semibold text-[#8a6d2f] bg-[#fbf5e6] border border-[#d6be8b] px-2 py-0.5 rounded-full">
                  {isTamil ? 'தனித்தனியாக உள்ளிடவும்' : 'Fill separately'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* 1. Tamil Name Field */}
                <div>
                  <TamilInput
                    id="reg-name"
                    label={
                      isTamil
                        ? formData.gender === 'bride'
                          ? 'மணமகள் பெயர் (தமிழில்) *'
                          : 'மணமகன் பெயர் (தமிழில்) *'
                        : formData.gender === 'bride'
                          ? 'Bride Name (in Tamil) *'
                          : 'Groom Name (in Tamil) *'
                    }
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    lockTamil={true}
                    placeholder={
                      formData.gender === 'bride'
                        ? 'எ.கா: நஸ்ரின் பானு'
                        : 'எ.கா: முஹம்மது அர்ஷத்'
                    }
                    required
                    helperText={
                      isTamil
                        ? 'வரனின் பெயரை தமிழில் உள்ளிடவும் (தமிழ் மட்டும்).'
                        : 'Enter candidate name in Tamil (Tamil only).'
                    }
                  />
                </div>

                {/* 2. English Name Field */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-1">
                    <label
                      htmlFor="reg-nameEn"
                      className="block text-xs font-bold text-[#44351b]"
                    >
                      {isTamil
                        ? formData.gender === 'bride'
                          ? 'மணமகள் பெயர் (ஆங்கிலத்தில்) *'
                          : 'மணமகன் பெயர் (ஆங்கிலத்தில்) *'
                        : formData.gender === 'bride'
                          ? 'Bride Name (in English) *'
                          : 'Groom Name (in English) *'}
                      <span className="text-red-500"> *</span>
                    </label>
                    <span className="px-2 py-0.5 rounded font-bold text-[11px] bg-white text-gray-700 border border-gray-300">
                      English
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      id="reg-nameEn"
                      type="text"
                      name="nameEn"
                      value={formData.nameEn || ''}
                      onChange={handleEnglishNameChange}
                      placeholder={
                        formData.gender === 'bride'
                          ? 'e.g., Nasrin Banu'
                          : 'e.g., Mohamed Arshath'
                      }
                      required
                      className="w-full px-3 py-1.5 text-sm bg-white border border-[#c5b597] rounded-md focus:outline-none focus:ring-2 focus:ring-[#8a6d2f] text-gray-900 shadow-inner"
                    />
                  </div>

                  <p className="text-[11px] text-gray-500 italic">
                    {isTamil
                      ? 'வரனின் பெயரை ஆங்கிலத்தில் உள்ளிடவும் (ஆங்கிலம் மட்டும்).'
                      : 'Enter candidate name in English (English only).'}
                  </p>
                </div>
              </div>
            </div>

            {/* Publisher (The one who actually registering: Name & Relationship) */}
            <div className="bg-[#fcfaf4] p-3.5 rounded-lg border border-[#e5dcce] space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#745821]">
                <FaUserTie />
                <span>
                  {isTamil
                    ? 'பதிவு செய்பவர் விவரம் (Publisher Details) *'
                    : 'Publisher (Person Registering This Profile) *'}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <TamilInput
                    label={isTamil ? 'பதிவு செய்பவரின் பெயர் (Publisher Name)' : "Publisher's Name"}
                    name="publisherName"
                    value={formData.publisherName}
                    onChange={handleChange}
                    placeholder={isTamil ? 'எ.கா: அப்துல் காதர்' : 'e.g. Abdul Khader'}
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] sm:text-xs font-bold text-gray-700 mb-1">
                    {isTamil ? 'வரனுடன் உறவுமுறை (Relationship) *' : 'Relationship with Candidate *'}
                  </label>
                  <select
                    name="publisherRelationship"
                    value={formData.publisherRelationship}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-1.5 text-xs sm:text-sm bg-white border border-[#c5b597] rounded-md focus:ring-2 focus:ring-[#8a6d2f] text-gray-900 font-semibold"
                  >
                    <option value="Self">{isTamil ? 'சுய பதிவு (Self)' : 'Self'}</option>
                    <option value="Father">{isTamil ? 'தந்தை (Father)' : 'Father'}</option>
                    <option value="Mother">{isTamil ? 'தாய் (Mother)' : 'Mother'}</option>
                    <option value="Brother">{isTamil ? 'சகோதரன் (Brother)' : 'Brother'}</option>
                    <option value="Sister">{isTamil ? 'சகோதரி (Sister)' : 'Sister'}</option>
                    <option value="Guardian">{isTamil ? 'பாதுகாவலர் (Guardian)' : 'Guardian'}</option>
                    <option value="Relative">{isTamil ? 'உறவினர் (Relative)' : 'Relative'}</option>
                    <option value="Other">{isTamil ? 'பிறர் (Other)' : 'Other'}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* 3. MOBILE NUMBERS (With Multiple Numbers Option) & PASSWORD */}
          <div className="bg-white p-4 rounded-xl border border-[#c5b597]/70 shadow-sm space-y-4">
            <h4 className="font-extrabold text-xs sm:text-sm text-[#163828] border-b border-gray-100 pb-2 flex items-center gap-2">
              <FaPhoneAlt className="text-green-700" />
              <span>{isTamil ? 'தொடர்பு எண்கள் & கடவுச்சொல்' : 'Contact Numbers & Security Password'}</span>
            </h4>

            <div className="space-y-3">
              {/* Primary Mobile Number */}
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1 flex items-center justify-between">
                  <span>{isTamil ? 'முதன்மை மொபைல் எண் (Primary Mobile Number) *' : 'Primary Mobile Number *'}</span>
                  <span className="text-[10px] text-gray-500">{isTamil ? 'உள்நுழைய பயன்படும்' : 'Used for login'}</span>
                </label>
                <div className="flex gap-2">
                  <span className="px-3 py-1.5 bg-gray-100 border border-[#c5b597] rounded-md text-gray-600 font-bold flex items-center">
                    +91
                  </span>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="9876543210"
                    maxLength={14}
                    required
                    className="flex-1 px-3 py-1.5 text-xs sm:text-sm bg-white border border-[#c5b597] rounded-md focus:ring-2 focus:ring-[#8a6d2f] text-gray-900 font-mono font-bold"
                  />
                </div>
              </div>

              {/* Additional Mobile Numbers (Multiple Option) */}
              <div className="space-y-2 pt-1">
                <label className="block text-xs font-bold text-gray-700">
                  {isTamil
                    ? 'கூடுதல் தொடர்பு எண்கள் (Additional Mobile Numbers - Optional)'
                    : 'Additional Mobile Numbers (Optional)'}
                </label>

                {formData.additionalPhones.map((extraPhone, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="tel"
                      value={extraPhone}
                      onChange={(e) => handleAdditionalPhoneChange(idx, e.target.value)}
                      placeholder={
                        isTamil
                          ? `கூடுதல் எண் ${idx + 1} (எ.கா: தந்தை / தாய் எண்)`
                          : `Additional Phone ${idx + 1} (e.g. Father/Mother)`
                      }
                      maxLength={14}
                      className="flex-1 px-3 py-1.5 text-xs sm:text-sm bg-white border border-[#c5b597] rounded-md focus:ring-2 focus:ring-[#8a6d2f] text-gray-900 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoneField(idx)}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition"
                      title={isTamil ? 'நீக்குக' : 'Remove number'}
                    >
                      <FaTrash className="text-xs" />
                    </button>
                  </div>
                ))}

                {formData.additionalPhones.length < 3 && (
                  <button
                    type="button"
                    onClick={handleAddPhoneField}
                    className="mt-1 text-xs font-bold text-[#163828] hover:text-[#255e43] inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#e8f1ec] border border-[#b2d5c3] transition"
                  >
                    <FaPlus className="text-[10px]" />
                    <span>{isTamil ? '+ மேலும் ஒரு மொபைல் எண் சேர்க்க' : '+ Add Another Mobile Number'}</span>
                  </button>
                )}
              </div>

              {/* Optional Email Address Field */}
              <div className="pt-2 border-t border-gray-100">
                <label className="block text-xs font-bold text-gray-800 mb-1 flex items-center justify-between">
                  <span>{isTamil ? 'மின்னஞ்சல் முகவரி (Email Address - விருப்பத்தேர்வு)' : 'Email Address (Optional)'}</span>
                  <span className="text-[10px] text-gray-500 font-semibold">{isTamil ? 'விருப்பத்தேர்வு (Optional)' : 'Optional'}</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={isTamil ? 'எ.கா: example@gmail.com' : 'e.g. example@gmail.com'}
                  className="w-full px-3 py-1.5 text-xs sm:text-sm bg-white border border-[#c5b597] rounded-md focus:ring-2 focus:ring-[#8a6d2f] text-gray-900"
                />
              </div>

              {/* Password Field */}
              <div className="pt-2 border-t border-gray-100">
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  {isTamil ? 'கடவுச்சொல் (Password) *' : 'Password (min 6 characters) *'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full px-3 py-1.5 pr-10 text-xs sm:text-sm bg-white border border-[#c5b597] rounded-md focus:ring-2 focus:ring-[#8a6d2f] text-gray-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 4. PERSONAL, SOCIAL & DEMOGRAPHIC DETAILS */}
          <div className="bg-white p-4 rounded-xl border border-[#c5b597]/70 shadow-sm space-y-4">
            <h4 className="font-extrabold text-xs sm:text-sm text-[#163828] border-b border-gray-100 pb-2 flex items-center gap-2">
              <FaLanguage className="text-indigo-600" />
              <span>{isTamil ? 'தனிநபர் & சமுதாய விவரங்கள்' : 'Personal & Demographic Details'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Age */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {isTamil ? 'வயது (Age) *' : 'Age *'}
                </label>
                <select
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 text-xs sm:text-sm bg-white border border-[#c5b597] rounded-md focus:ring-2 focus:ring-[#8a6d2f] text-gray-900 font-semibold"
                >
                  {Array.from({ length: 55 }, (_, i) => i + 18).map((num) => (
                    <option key={num} value={num}>
                      {num} {isTamil ? 'வயது' : 'Years'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Marital Status */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {isTamil ? 'திருமண நிலை (Marital Status) *' : 'Marital Status *'}
                </label>
                <select
                  name="maritalStatus"
                  value={formData.maritalStatus}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-1.5 text-xs sm:text-sm bg-white border border-[#c5b597] rounded-md focus:ring-2 focus:ring-[#8a6d2f] text-gray-900 font-semibold"
                >
                  <option value="Un married">
                    {isTamil ? 'திருமணம் ஆகாதவர் (Un married)' : 'Un married'}
                  </option>
                  <option value="Divorced">
                    {isTamil ? 'விவாகரத்து ஆனவர் (Divorced)' : 'Divorced'}
                  </option>
                  <option value="Applied for divorce">
                    {isTamil ? 'விவாகரத்து கோரியவர் (Applied for divorce)' : 'Applied for divorce'}
                  </option>
                  <option value="Bereaved of a partner">
                    {isTamil ? 'துணையை இழந்தவர் (Bereaved of a partner)' : 'Bereaved of a partner'}
                  </option>
                  <option value="Additional Marriage">
                    {isTamil ? 'கூடுதல் திருமணம் / மறுமணம் (Additional Marriage)' : 'Additional Marriage'}
                  </option>
                </select>
              </div>

              {/* Language */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {isTamil ? 'மொழி & இனம் (Language) *' : 'Language *'}
                </label>
                <select
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-1.5 text-xs sm:text-sm bg-white border border-[#c5b597] rounded-md focus:ring-2 focus:ring-[#8a6d2f] text-gray-900 font-semibold"
                >
                  <option value="Tamil-Muslim">
                    {isTamil ? 'தமிழ்-முஸ்லிம் (Tamil-Muslim)' : 'Tamil-Muslim'}
                  </option>
                  <option value="Urdu-Muslim">
                    {isTamil ? 'உருது-முஸ்லிம் (Urdu-Muslim)' : 'Urdu-Muslim'}
                  </option>
                  <option value="Tamil-Urdu Muslim">
                    {isTamil ? 'தமிழ்-உருது முஸ்லிம் (Tamil-Urdu Muslim)' : 'Tamil-Urdu Muslim'}
                  </option>
                  <option value="Kerala-Muslim">
                    {isTamil ? 'கேரளா-முஸ்லிம் (Kerala-Muslim)' : 'Kerala-Muslim'}
                  </option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
              {/* Location */}
              <div>
                <TamilInput
                  label={isTamil ? 'இருப்பிடம் (Location)' : 'Location'}
                  name="location"
                  list="district-options"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder={isTamil ? 'எ.கா: சென்னை / மதுரை / துபாய்' : 'e.g. Chennai / Madurai / Dubai'}
                  required
                />
                <datalist id="district-options">
                  {TAMIL_NADU_DISTRICTS.map((dist) => (
                    <option key={dist} value={dist}>
                      {dist} {DISTRICT_MAP[dist] ? `(${DISTRICT_MAP[dist]})` : ''}
                    </option>
                  ))}
                  <option value="Bangalore" />
                  <option value="Dubai" />
                  <option value="Singapore" />
                  <option value="Malaysia" />
                  <option value="Saudi Arabia" />
                  <option value="United Kingdom" />
                </datalist>
              </div>

              {/* Height (Enterable as text with Tamil support) */}
              <div>
                <TamilInput
                  label={isTamil ? 'உயரம் (Height)' : 'Height'}
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  placeholder={isTamil ? 'எ.கா: 5.6 அடி / 5 ft 6 in' : 'e.g. 5.6 அடி / 5\'6" / 168 cm'}
                />
              </div>
            </div>
          </div>

          {/* 5. EDUCATION, OCCUPATION, INCOME & PROPERTIES */}
          <div className="bg-white p-4 rounded-xl border border-[#c5b597]/70 shadow-sm space-y-4">
            <h4 className="font-extrabold text-xs sm:text-sm text-[#163828] border-b border-gray-100 pb-2 flex items-center gap-2">
              <FaGraduationCap className="text-amber-700" />
              <span>{isTamil ? 'கல்வி, தொழில் & பொருளாதார விவரங்கள்' : 'Education, Career & Assets'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
              {/* Education */}
              <div>
                <TamilInput
                  label={isTamil ? 'கல்வித் தகுதி (Education)' : 'Education Qualification'}
                  name="education"
                  value={formData.education}
                  onChange={handleChange}
                  placeholder="B.E / B.Tech / MBA / MBBS / Arts"
                  required
                />
              </div>

              {/* Occupation */}
              <div>
                <TamilInput
                  label={isTamil ? 'தொழில் / பணி (Occupation)' : 'Occupation / Job'}
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleChange}
                  placeholder={isTamil ? 'எ.கா: மென்பொருள் பொறியாளர் / வணிகம்' : 'e.g. Software Engineer / Business / Govt'}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
              {/* Workplace */}
              <div>
                <TamilInput
                  label={isTamil ? 'பணிபுரியும் இடம் (Workplace)' : 'Workplace'}
                  name="workplace"
                  value={formData.workplace}
                  onChange={handleChange}
                  placeholder={isTamil ? 'எ.கா: சென்னை / துபாய் / பெங்களூரு' : 'e.g. Chennai / Dubai / Bangalore'}
                />
              </div>

              {/* Monthly Income (With Placeholder as requested) */}
              <div>
                <TamilInput
                  label={isTamil ? 'வருமானம் (Income)' : 'Income'}
                  name="income"
                  value={formData.income}
                  onChange={handleChange}
                  placeholder={
                    isTamil
                      ? 'Monthly Income / மாத வருமானம் (எ.கா: ₹50,000)'
                      : 'Monthly Income (e.g. ₹50,000 / $3,000)'
                  }
                />
              </div>
            </div>

            {/* Properties */}
            <div>
              <TamilInput
                label={isTamil ? 'சொத்துக்கள் (Properties)' : 'Properties'}
                name="properties"
                value={formData.properties}
                onChange={handleChange}
                placeholder={isTamil ? 'எ.கா: சொந்த வீடு, மனை / நன்செய் நிலம்' : 'e.g. Own House, Land, Commercial plot'}
              />
            </div>
          </div>

          {/* 6. PHOTOS (MAXIMUM UPTO FIVE) */}
          <div className="bg-white p-4 rounded-xl border border-[#c5b597]/70 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <label className="text-xs sm:text-sm font-extrabold text-[#163828] flex items-center gap-2">
                <FaCamera className="text-blue-600" />
                <span>{isTamil ? 'புகைப்படங்கள் (Photos - Maximum 5)' : 'Photos (Maximum up to 5)'}</span>
              </label>
              <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2.5 py-0.5 rounded-full">
                {photos.length} / 5 {isTamil ? 'தேர்வு செய்யப்பட்டது' : 'selected'}
              </span>
            </div>

            {/* Photo Previews */}
            {photoPreviews.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 pt-1">
                {photoPreviews.map((url, idx) => (
                  <div key={idx} className="relative group rounded-lg overflow-hidden border-2 border-amber-300 shadow-sm bg-gray-50 aspect-square">
                    <img
                      src={url}
                      alt={`Upload preview ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(idx)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 text-xs shadow hover:bg-red-700 transition"
                      title={isTamil ? 'புகைப்படத்தை நீக்குக' : 'Remove photo'}
                    >
                      <FaTimes />
                    </button>
                    <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                      {idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Button */}
            {photos.length < 5 && (
              <div>
                <input
                  type="file"
                  ref={photoInputRef}
                  onChange={handlePhotoSelect}
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  multiple
                  className="hidden"
                  id="photo-upload-input"
                />
                <label
                  htmlFor="photo-upload-input"
                  className="border-2 border-dashed border-[#caa85d] rounded-xl p-4 bg-[#fbf9f2] hover:bg-[#f6f2e3] cursor-pointer text-center flex flex-col items-center justify-center gap-1.5 transition block"
                >
                  <FaCamera className="text-2xl text-[#8a6d2f]" />
                  <span className="text-xs font-bold text-[#163828]">
                    {isTamil ? 'புகைப்படம் பதிவேற்ற கிளிக் செய்யவும் (5 வரை)' : 'Click to Upload Photos (Up to 5)'}
                  </span>
                  <span className="text-[11px] text-gray-500">
                    JPG, PNG, WEBP (Max 5MB each)
                  </span>
                </label>
              </div>
            )}
          </div>

          {/* 7. AUDIO CLIP: LIVE RECORDING & UPLOAD */}
          <div className="bg-white p-4 rounded-xl border border-[#c5b597]/70 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <label className="text-xs sm:text-sm font-extrabold text-[#163828] flex items-center gap-2">
                <FaMicrophone className="text-rose-600" />
                <span>
                  {isTamil
                    ? 'நேரடி குரல் பதிவு & ஆடியோ பதிவேற்றம் (Audio Note)'
                    : 'Live Voice Recording & Audio Upload'}
                </span>
              </label>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                Optional
              </span>
            </div>

            {/* Live Audio Recorder Component */}
            <LiveAudioRecorder
              onAudioReady={(file, preview) => {
                setAudioFile(file);
                setAudioPreviewUrl(preview);
              }}
              onAudioRemove={() => {
                setAudioFile(null);
                setAudioPreviewUrl('');
              }}
              currentAudioFile={audioFile}
              currentAudioUrl={audioPreviewUrl}
            />

            {/* Explicit Description below Audio Clip as required */}
            <div className="p-2.5 bg-amber-50/70 border border-amber-200/80 rounded-lg text-[11px] sm:text-xs text-amber-900 leading-relaxed space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <FaInfoCircle className="text-amber-700 flex-shrink-0" />
                <span>
                  {isTamil
                    ? 'ஆடியோ குறிப்பு விவரம் (Audio Clip Description):'
                    : 'Audio Clip Description & Purpose:'}
                </span>
              </p>
              <p className="text-gray-700 pl-4">
                {isTamil
                  ? 'குடும்ப உறுப்பினர்கள், அவர்களின் தொழில் மற்றும் கூடுதல் தகவல்களை இந்த ஆடியோ பதிவில் சுருக்கமாக விவரிக்கலாம். (Family members, their occupation and additional information).'
                  : 'You can upload an audio note describing family members, their occupation and additional information about the bride/groom.'}
              </p>
            </div>
          </div>

          {/* 8. DESCRIPTION (LIMITED TO TWO LINES WITH TAMIL INPUT) */}
          <div className="bg-white p-4 rounded-xl border border-[#c5b597]/70 shadow-sm space-y-2">
            <TamilInput
              label={
                isTamil
                  ? 'சுயவிவர குறிப்பு (Description - 2 வரிகளுக்குள்)'
                  : 'Description (Limited to two lines)'
              }
              name="description"
              value={formData.description}
              onChange={handleChange}
              isTextArea={true}
              rows={2}
              maxLength={160}
              placeholder={
                isTamil
                  ? 'குடும்ப பின்னணி மற்றும் எதிர்பார்ப்பு குறித்த சுருக்கமான 2 வரி குறிப்பு...'
                  : 'Brief 2-line description of personality, family background, or expectations...'
              }
              helperText={
                isTamil
                  ? `${formData.description.length}/160 எழுத்துகள் (அதிகபட்சம் 2 வரிகளில் சுருக்கமாக எழுதவும்)`
                  : `${formData.description.length}/160 characters (Limited to 2 lines)`
              }
            />
          </div>

          {/* 9. DECLARATION CONFIRMING READY TO SHARE DATA & NON-REMOVAL FOR 1 MONTH */}
          <div className="bg-[#f5efe1] p-4 rounded-xl border-2 border-[#caa85d] shadow-sm space-y-3">
            <h4 className="font-extrabold text-xs sm:text-sm text-[#163828] flex items-center gap-2">
              <FaLock className="text-amber-800" />
              <span>{isTamil ? 'உறுதிமொழி & நிபந்தனைகள் (Declaration)' : 'Declaration & Terms of Registration'}</span>
            </h4>

            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                id="reg-declaration"
                name="declarationAgreed"
                checked={formData.declarationAgreed}
                onChange={handleChange}
                className="mt-1 w-4 h-4 text-[#163828] accent-[#163828] rounded border-gray-400 focus:ring-[#8a6d2f] flex-shrink-0 cursor-pointer"
              />
              <div className="text-xs sm:text-sm text-[#3b2b11] leading-relaxed">
                <p className="font-bold">
                  {isTamil
                    ? '1. நான் எனது இந்த சுயவிவரத் தகவல்களை இத்தளத்தில் பகிர்ந்து கொள்ள முழு மனதுடன் சம்மதிக்கிறேன்.'
                    : '1. I confirm that I am ready and willing to share this matrimonial profile data with this website.'}
                </p>
                <p className="font-bold mt-1 text-red-900">
                  {isTamil
                    ? '2. பதிவு செய்த நாளிலிருந்து குறைந்தபட்சம் ஒரு மாதத்திற்கு (1 Month) இந்த பதிவை நீக்கவோ அல்லது ரத்து செய்யவோ முடியாது என்பதை ஏற்றுக்கொள்கிறேன்.'
                    : '2. I understand and agree that this registration cannot be removed or cancelled for a minimum period of one month.'}
                </p>
              </div>
            </label>
          </div>

          {/* 10. SUBMIT BUTTON (Single Page Registration Final Action) */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#163828] via-[#24583f] to-[#163828] hover:from-[#1b4330] hover:to-[#1b4330] text-[#fffae6] font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl border border-[#caa85d] transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-[#caa85d] border-t-transparent rounded-full animate-spin" />
                  <span>{isTamil ? 'பதிவாகிறது... தயவுசெய்து காத்திருக்கவும்' : 'Submitting Registration... Please wait'}</span>
                </>
              ) : (
                <>
                  <FaCheckCircle className="text-amber-400 text-lg" />
                  <span>{isTamil ? 'வரன் பதிவை சமர்ப்பிக்கவும் (Submit Registration)' : 'Submit Registration'}</span>
                </>
              )}
            </button>
            <p className="text-center text-[11px] text-gray-500 mt-2">
              {isTamil
                ? 'பதிவு செய்தவுடன் உங்கள் சுயவிவரம் உடனடியாக தளத்தில் செயல்பாட்டுக்கு வரும்.'
                : 'Your profile will be immediately registered and active upon submission.'}
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
