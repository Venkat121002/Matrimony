import React, { useState, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import TamilInput from './TamilInput';
import LiveAudioRecorder from './LiveAudioRecorder';
import {
  FaTrash,
  FaCamera,
  FaFileAudio,
  FaMicrophone,
  FaPlus,
  FaUser,
  FaPhoneAlt,
  FaGraduationCap,
  FaTimes,
  FaInfoCircle,
} from 'react-icons/fa';
import { TAMIL_NADU_DISTRICTS, DISTRICT_MAP } from '../data/districts';

export default function EditProfileForm({ currentUser, onSave, onCancel }) {
  const { isTamil } = useLanguage();

  const [formData, setFormData] = useState({
    fullName: currentUser.fullName || '',
    fullNameEn: currentUser.fullNameEn || '',
    phone: currentUser.phone || '',
    additionalPhones: Array.isArray(currentUser.additionalPhones) && currentUser.additionalPhones.length > 0
      ? currentUser.additionalPhones
      : [''],
    email: currentUser.email && !currentUser.email.endsWith('@tamilnikah.com') ? currentUser.email : '',
    age: currentUser.age || '',
    gender: currentUser.gender || 'groom',
    maritalStatus: currentUser.maritalStatus || 'Un married',
    language: currentUser.language || 'Tamil-Muslim',
    location: currentUser.location || currentUser.nativePlace || currentUser.district || '',
    height: currentUser.height || '5.6 அடி (5\'6")',
    education: currentUser.education || '',
    occupation: currentUser.occupation || currentUser.profession || '',
    workplace: currentUser.workplace || '',
    monthlyIncome: currentUser.monthlyIncome || currentUser.income || '',
    properties: currentUser.properties || currentUser.property || '',
    description: currentUser.description || currentUser.bio || '',
    publisherName: currentUser.publisher?.name || currentUser.publisherName || currentUser.fullName || '',
    publisherRelationship: currentUser.publisher?.relationship || currentUser.publisherRelationship || 'Self',
  });

  const [saving, setSaving] = useState(false);
  const [existingPhotos, setExistingPhotos] = useState(currentUser.photos || []);
  const [newPhotos, setNewPhotos] = useState([]);
  const [newPhotoPreviews, setNewPhotoPreviews] = useState([]);

  const [existingAudio, setExistingAudio] = useState(currentUser.audioClip || null);
  const [deleteAudio, setDeleteAudio] = useState(false);
  const [newAudioFile, setNewAudioFile] = useState(null);
  const [newAudioPreview, setNewAudioPreview] = useState('');

  const photoInputRef = useRef(null);
  const audioInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEnglishNameChange = (e) => {
    const val = e.target.value.replace(/[\u0B80-\u0BFF]/g, '');
    setFormData((prev) => ({ ...prev, fullNameEn: val }));
  };

  // Additional Phones Handlers
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

  // Photo Select
  const handlePhotoSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const totalCount = existingPhotos.length + newPhotos.length + files.length;
    if (totalCount > 5) {
      alert(isTamil ? 'நீங்கள் அதிகபட்சம் 5 புகைப்படங்கள் மட்டுமே பதிவேற்ற முடியும்.' : 'You can only upload a maximum of 5 photos.');
      return;
    }
    const validFiles = files.filter((file) => {
      if (!file.type.startsWith('image/')) {
        alert(isTamil ? 'தயவுசெய்து படங்களை மட்டுமே தேர்ந்தெடுக்கவும்.' : 'Please select only image files.');
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert(isTamil ? 'படத்தின் அளவு 5MB-க்குள் இருக்க வேண்டும்.' : 'Image size must be under 5MB.');
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      setNewPhotos((prev) => [...prev, ...validFiles]);
      const previews = validFiles.map((file) => URL.createObjectURL(file));
      setNewPhotoPreviews((prev) => [...prev, ...previews]);
    }
    if (photoInputRef.current) photoInputRef.current.value = '';
  };

  const handleRemoveExistingPhoto = (index) => {
    setExistingPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveNewPhoto = (index) => {
    setNewPhotos((prev) => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(newPhotoPreviews[index]);
    setNewPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Audio Select
  const handleAudioSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isAudioType =
      file.type.startsWith('audio/') ||
      file.type.startsWith('video/webm') ||
      file.type === 'video/mp4' ||
      file.type === 'application/octet-stream' ||
      file.type === 'application/ogg';
    const isAudioExt = file.name.match(/\.(mp3|wav|m4a|aac|ogg|webm|amr|3gp|flac|wma|opus|mp4)$/i);

    if (!isAudioType && !isAudioExt) {
      alert(isTamil ? 'தயவுசெய்து ஆடியோ கோப்பை (MP3, WAV, M4A, AAC, WEBM) மட்டுமே தேர்ந்தெடுக்கவும்.' : 'Please select a valid audio file (MP3, WAV, M4A, AAC, WEBM).');
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      alert(isTamil ? 'ஆடியோ அளவு 25MB-க்குள் இருக்க வேண்டும்.' : 'Audio file must be under 25MB.');
      return;
    }
    if (newAudioPreview) URL.revokeObjectURL(newAudioPreview);
    setNewAudioFile(file);
    setNewAudioPreview(URL.createObjectURL(file));
    if (audioInputRef.current) audioInputRef.current.value = '';
    setDeleteAudio(false);
  };

  const handleRemoveAudio = () => {
    if (newAudioPreview) URL.revokeObjectURL(newAudioPreview);
    setNewAudioFile(null);
    setNewAudioPreview('');
    setDeleteAudio(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('nikah_token');
      const data = new FormData();

      Object.keys(formData).forEach((key) => {
        if (key === 'additionalPhones') {
          const filtered = formData.additionalPhones.filter(Boolean);
          data.append('additionalPhones', JSON.stringify(filtered));
        } else {
          data.append(key, formData[key]);
        }
      });

      // Synchronize location aliases
      data.append('district', formData.location);
      data.append('nativePlace', formData.location);

      data.append('existingPhotos', JSON.stringify(existingPhotos));

      newPhotos.forEach((photo) => {
        data.append('photos', photo);
      });

      if (deleteAudio && !newAudioFile) {
        data.append('deleteAudio', 'true');
      }
      if (newAudioFile) {
        data.append('audioClip', newAudioFile);
      }

      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      const result = await res.json();
      if (result.success) {
        onSave(result.user);
      } else {
        alert(result.message || 'Error updating profile');
      }
    } catch (err) {
      alert('Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-[#fbf9f2] rounded-2xl shadow-xl border-2 border-[#caa85d] p-4 sm:p-6 mb-8 animate-fadeIn">
      <div className="flex items-center justify-between pb-3 border-b-2 border-[#caa85d] mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#163828]">
            {isTamil ? 'சுயவிவரத்தை திருத்து' : 'Edit Your Profile'}
          </h2>
          <p className="text-xs text-gray-600 mt-0.5">
            {isTamil ? 'பதிவு படிவத்தில் உள்ள விவரங்கள் மட்டுமே இங்கே திருத்தப்படும்.' : 'Only details matching the registration form are edited here.'}
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-800 p-2 rounded-lg text-lg"
          title={isTamil ? 'மூடுக' : 'Close'}
        >
          <FaTimes />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECTION 1: CANDIDATE BASIC DETAILS */}
        <div className="bg-white p-4 rounded-xl border border-[#c5b597]/70 shadow-sm space-y-4">
          <h3 className="font-extrabold text-sm sm:text-base text-[#163828] border-b border-gray-100 pb-2 flex items-center gap-2">
            <FaUser className="text-[#8a6d2f]" />
            <span>1. {isTamil ? 'வரன் தனிநபர் விவரங்கள்' : 'Candidate Details'}</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <TamilInput
                label={isTamil ? 'வரன் பெயர் (தமிழில்)' : 'Candidate Name (Tamil)'}
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {isTamil ? 'வரன் பெயர் (ஆங்கிலத்தில்) *' : 'Candidate Name (English) *'}
              </label>
              <input
                type="text"
                name="fullNameEn"
                value={formData.fullNameEn}
                onChange={handleEnglishNameChange}
                required
                className="w-full px-3 py-1.5 text-xs sm:text-sm bg-white border border-[#c5b597] rounded-md focus:ring-2 focus:ring-[#8a6d2f] text-gray-900 font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {isTamil ? 'பாலினம் (Gender) *' : 'Gender *'}
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                className="w-full px-3 py-1.5 text-xs sm:text-sm bg-white border border-[#c5b597] rounded-md focus:ring-2 focus:ring-[#8a6d2f] text-gray-900 font-semibold"
              >
                <option value="groom">{isTamil ? 'மணமகன் (Groom)' : 'Groom'}</option>
                <option value="bride">{isTamil ? 'மணமகள் (Bride)' : 'Bride'}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {isTamil ? 'வயது (Age) *' : 'Age *'}
              </label>
              <input
                type="number"
                name="age"
                min="18"
                max="80"
                value={formData.age}
                onChange={handleChange}
                required
                className="w-full px-3 py-1.5 text-xs sm:text-sm bg-white border border-[#c5b597] rounded-md focus:ring-2 focus:ring-[#8a6d2f] text-gray-900 font-semibold"
              />
            </div>
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
                <option value="Un married">{isTamil ? 'திருமணம் ஆகாதவர் (Un married)' : 'Un married'}</option>
                <option value="Divorced">{isTamil ? 'விவாகரத்தானவர் (Divorced)' : 'Divorced'}</option>
                <option value="Applied for divorce">{isTamil ? 'விவாகரத்து கோரியவர் (Applied for divorce)' : 'Applied for divorce'}</option>
                <option value="Bereaved of a partner">{isTamil ? 'துணையை இழந்தவர் (Bereaved)' : 'Bereaved of a partner'}</option>
                <option value="Additional Marriage">{isTamil ? 'இரண்டாம் மணம் (Additional Marriage)' : 'Additional Marriage'}</option>
              </select>
            </div>
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
                <option value="Tamil-Muslim">{isTamil ? 'தமிழ்-முஸ்லிம் (Tamil-Muslim)' : 'Tamil-Muslim'}</option>
                <option value="Urdu-Muslim">{isTamil ? 'உருது-முஸ்லிம் (Urdu-Muslim)' : 'Urdu-Muslim'}</option>
                <option value="Tamil-Urdu Muslim">{isTamil ? 'தமிழ்-உருது முஸ்லிம் (Tamil-Urdu Muslim)' : 'Tamil-Urdu Muslim'}</option>
                <option value="Kerala-Muslim">{isTamil ? 'கேரளா-முஸ்லிம் (Kerala-Muslim)' : 'Kerala-Muslim'}</option>
              </select>
            </div>

            {/* Native Location */}
            <div>
              <TamilInput
                label={isTamil ? 'சொந்த இருப்பிடம் (Native Location) *' : 'Native Location *'}
                name="location"
                list="edit-district-options"
                value={formData.location}
                onChange={handleChange}
                placeholder={isTamil ? 'எ.கா: சென்னை / மதுரை / துபாய்' : 'e.g. Chennai / Madurai / Dubai'}
                required
              />
              <datalist id="edit-district-options">
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
              </datalist>
            </div>

            {/* Height */}
            <div>
              <TamilInput
                label={isTamil ? 'உயரம் (Height)' : 'Height'}
                name="height"
                value={formData.height}
                onChange={handleChange}
                placeholder={isTamil ? 'எ.கா: 5.6 அடி / 5 ft 6 in' : 'e.g. 5.6 அடி / 5\'6"'}
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: CONTACT NUMBERS & PUBLISHER INFO */}
        <div className="bg-white p-4 rounded-xl border border-[#c5b597]/70 shadow-sm space-y-4">
          <h3 className="font-extrabold text-sm sm:text-base text-[#163828] border-b border-gray-100 pb-2 flex items-center gap-2">
            <FaPhoneAlt className="text-emerald-700" />
            <span>2. {isTamil ? 'தொடர்பு & பதிவு விவரங்கள்' : 'Contact & Publisher Info'}</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {isTamil ? 'முதன்மை மொபைல் எண் *' : 'Primary Mobile Number *'}
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-3 py-1.5 text-xs sm:text-sm bg-white border border-[#c5b597] rounded-md focus:ring-2 focus:ring-[#8a6d2f] text-gray-900 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {isTamil ? 'மின்னஞ்சல் (விருப்பத்தேர்வு)' : 'Email (Optional)'}
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="candidate@example.com"
                className="w-full px-3 py-1.5 text-xs sm:text-sm bg-white border border-[#c5b597] rounded-md focus:ring-2 focus:ring-[#8a6d2f] text-gray-900"
              />
            </div>

            {/* Additional Phones */}
            <div className="sm:col-span-2 space-y-2">
              <label className="block text-xs font-bold text-gray-700">
                {isTamil ? 'கூடுதல் மொபைல் எண்கள் (4 வரை)' : 'Additional Mobile Numbers (Up to 4)'}
              </label>
              {formData.additionalPhones.map((p, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="tel"
                    value={p}
                    onChange={(e) => handleAdditionalPhoneChange(idx, e.target.value)}
                    placeholder={isTamil ? `கூடுதல் எண் ${idx + 1}` : `Additional Phone ${idx + 1}`}
                    className="flex-1 px-3 py-1.5 text-xs sm:text-sm bg-white border border-[#c5b597] rounded-md focus:ring-2 focus:ring-[#8a6d2f] text-gray-900 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoneField(idx)}
                    className="p-2 text-red-600 hover:text-red-800 transition"
                    title={isTamil ? 'நீக்குக' : 'Remove'}
                  >
                    <FaTimes />
                  </button>
                </div>
              ))}
              {formData.additionalPhones.length < 4 && (
                <button
                  type="button"
                  onClick={handleAddPhoneField}
                  className="px-3 py-1 bg-amber-50 text-amber-900 border border-amber-300 rounded font-bold text-xs flex items-center gap-1 hover:bg-amber-100 transition"
                >
                  <FaPlus className="text-[10px]" />
                  <span>{isTamil ? 'கூடுதல் எண் சேர்க்க' : 'Add Another Phone'}</span>
                </button>
              )}
            </div>

            {/* Publisher Name & Relationship */}
            <div>
              <TamilInput
                label={isTamil ? 'பதிவு செய்தவர் பெயர்' : 'Publisher Name'}
                name="publisherName"
                value={formData.publisherName}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {isTamil ? 'வரனுடன் உறவுமுறை' : 'Publisher Relationship'}
              </label>
              <select
                name="publisherRelationship"
                value={formData.publisherRelationship}
                onChange={handleChange}
                className="w-full px-3 py-1.5 text-xs sm:text-sm bg-white border border-[#c5b597] rounded-md focus:ring-2 focus:ring-[#8a6d2f] text-gray-900 font-semibold"
              >
                <option value="Self">{isTamil ? 'சுய பதிவு (Self)' : 'Self'}</option>
                <option value="Father">{isTamil ? 'தந்தை (Father)' : 'Father'}</option>
                <option value="Mother">{isTamil ? 'தாய் (Mother)' : 'Mother'}</option>
                <option value="Brother">{isTamil ? 'சகோதரர் (Brother)' : 'Brother'}</option>
                <option value="Sister">{isTamil ? 'சகோதரி (Sister)' : 'Sister'}</option>
                <option value="Guardian">{isTamil ? 'பாதுகாவலர் (Guardian)' : 'Guardian'}</option>
                <option value="Relative">{isTamil ? 'உறவினர் (Relative)' : 'Relative'}</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 3: EDUCATION, OCCUPATION, WORKPLACE & ASSETS */}
        <div className="bg-white p-4 rounded-xl border border-[#c5b597]/70 shadow-sm space-y-4">
          <h3 className="font-extrabold text-sm sm:text-base text-[#163828] border-b border-gray-100 pb-2 flex items-center gap-2">
            <FaGraduationCap className="text-amber-700" />
            <span>3. {isTamil ? 'கல்வி, தொழில் & பொருளாதார விவரங்கள்' : 'Education, Career & Assets'}</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <TamilInput
                label={isTamil ? 'கல்வித் தகுதி (Education) *' : 'Education Qualification *'}
                name="education"
                value={formData.education}
                onChange={handleChange}
                placeholder="B.E / B.Tech / MBA / MBBS / Arts"
                required
              />
            </div>

            <div>
              <TamilInput
                label={isTamil ? 'தொழில் / பணி (Occupation) *' : 'Occupation / Job *'}
                name="occupation"
                value={formData.occupation}
                onChange={handleChange}
                placeholder={isTamil ? 'எ.கா: மென்பொருள் பொறியாளர் / வணிகம்' : 'e.g. Software Engineer / Business / Govt'}
                required
              />
            </div>

            {/* Workplace Location */}
            <div>
              <TamilInput
                label={isTamil ? 'பணிபுரியும் இடம் (Workplace Location)' : 'Workplace Location'}
                name="workplace"
                value={formData.workplace}
                onChange={handleChange}
                placeholder={isTamil ? 'எ.கா: சென்னை / துபாய் / பெங்களூரு' : 'e.g. Chennai / Dubai / Bangalore'}
              />
            </div>

            {/* Monthly Income */}
            <div>
              <TamilInput
                label={isTamil ? 'மாத வருமானம் (Monthly Income)' : 'Monthly Income'}
                name="monthlyIncome"
                value={formData.monthlyIncome}
                onChange={handleChange}
                placeholder={isTamil ? 'எ.கா: ₹50,000 / $3,000' : 'e.g. ₹50,000 / $3,000'}
              />
            </div>

            {/* Properties */}
            <div className="sm:col-span-2">
              <TamilInput
                label={isTamil ? 'சொத்துக்கள் (Properties)' : 'Properties'}
                name="properties"
                value={formData.properties}
                onChange={handleChange}
                placeholder={isTamil ? 'எ.கா: சொந்த வீடு, மனை / நன்செய் நிலம்' : 'e.g. Own House, Land, Commercial plot'}
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: PHOTOS (MAXIMUM 5) */}
        <div className="bg-white p-4 rounded-xl border border-[#c5b597]/70 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <label className="text-xs sm:text-sm font-extrabold text-[#163828] flex items-center gap-2">
              <FaCamera className="text-blue-600" />
              <span>{isTamil ? 'புகைப்படங்கள் (அதிகபட்சம் 5)' : 'Photos (Maximum 5)'}</span>
            </label>
            <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2.5 py-0.5 rounded-full">
              {existingPhotos.length + newPhotos.length} / 5 {isTamil ? 'தேர்வு செய்யப்பட்டுள்ளது' : 'selected'}
            </span>
          </div>

          <div className="flex flex-wrap gap-3">
            {/* Existing Photos */}
            {existingPhotos.map((url, idx) => (
              <div key={`ext-${idx}`} className="relative w-24 h-28 rounded-lg overflow-hidden border-2 border-[#caa85d] shadow-sm">
                <img src={url} alt={`Profile Photo ${idx + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveExistingPhoto(idx)}
                  className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full text-xs shadow hover:bg-red-700 transition"
                  title={isTamil ? 'நீக்குக' : 'Remove'}
                >
                  <FaTimes />
                </button>
              </div>
            ))}

            {/* New Photos */}
            {newPhotoPreviews.map((url, idx) => (
              <div key={`new-${idx}`} className="relative w-24 h-28 rounded-lg overflow-hidden border-2 border-emerald-500 shadow-sm">
                <img src={url} alt={`New Photo ${idx + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveNewPhoto(idx)}
                  className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full text-xs shadow hover:bg-red-700 transition"
                  title={isTamil ? 'நீக்குக' : 'Remove'}
                >
                  <FaTimes />
                </button>
              </div>
            ))}

            {/* Add Photo Button */}
            {existingPhotos.length + newPhotos.length < 5 && (
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="w-24 h-28 rounded-lg border-2 border-dashed border-[#caa85d] flex flex-col items-center justify-center gap-1 bg-[#fbf9f2] hover:bg-[#f6f2e3] cursor-pointer transition text-[#8a6d2f]"
              >
                <FaCamera className="text-xl" />
                <span className="text-[11px] font-bold">{isTamil ? 'சேர்' : 'Add'}</span>
              </button>
            )}
          </div>
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/jpg"
            ref={photoInputRef}
            onChange={handlePhotoSelect}
            className="hidden"
          />
        </div>

        {/* SECTION 5: AUDIO CLIP & DESCRIPTION */}
        <div className="bg-white p-4 rounded-xl border border-[#c5b597]/70 shadow-sm space-y-4">
          <div className="border-b border-gray-100 pb-2">
            <h4 className="font-extrabold text-sm text-[#163828] flex items-center gap-1.5">
              <FaMicrophone className="text-rose-600" />
              <span>{isTamil ? 'குரல் பதிவு & சுயவிவர குறிப்பு' : 'Voice Clip & Bio Description'}</span>
            </h4>
          </div>

          {/* Description */}
          <div>
            <TamilInput
              label={isTamil ? 'சுயவிவர குறிப்பு (Description - 2 வரிகளுக்குள்)' : 'Description (Limited to 2 lines)'}
              name="description"
              value={formData.description}
              onChange={handleChange}
              isTextArea={true}
              rows={2}
              maxLength={160}
              placeholder={isTamil ? 'குடும்ப பின்னணி மற்றும் எதிர்பார்ப்பு குறித்த 2 வரி குறிப்பு...' : 'Brief 2-line description of personality, family background, or expectations...'}
              helperText={`${formData.description.length}/160 ${isTamil ? 'எழுத்துகள் (அதிகபட்சம் 2 வரிகளில்)' : 'characters (2 lines max)'}`}
            />
          </div>

          {/* Audio Note (Voice Recording) */}
          <div className="pt-2">
            <label className="block text-xs font-bold text-gray-700 mb-2">
              {isTamil ? 'குரல் பதிவு (Voice Recording - Optional)' : 'Audio Note (Voice Recording - Optional)'}
            </label>

            {existingAudio?.url && !deleteAudio && !newAudioFile ? (
              <div className="flex items-center justify-between bg-amber-50 p-3 rounded-lg border border-amber-300">
                <div className="flex items-center gap-2">
                  <FaFileAudio className="text-[#8a6d2f] text-xl" />
                  <div>
                    <span className="text-xs font-bold text-amber-900 block">
                      {isTamil ? 'தற்போதுள்ள குரல் பதிவு' : 'Existing Audio Note'}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      {isTamil ? 'மாற்ற விரும்பினால் "மாற்ற" அழுத்தவும்' : 'Click change to record or upload a new one'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <audio controls src={existingAudio.url} className="h-8 max-w-[200px]" />
                  <button
                    type="button"
                    onClick={() => setDeleteAudio(true)}
                    className="px-2.5 py-1 text-xs font-bold text-red-700 bg-red-100 hover:bg-red-200 border border-red-300 rounded transition flex items-center gap-1 cursor-pointer"
                    title={isTamil ? 'நீக்க அல்லது மாற்ற' : 'Remove or replace'}
                  >
                    <FaTimes />
                    <span>{isTamil ? 'மாற்ற' : 'Change'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <LiveAudioRecorder
                onAudioReady={(file, preview) => {
                  setNewAudioFile(file);
                  setNewAudioPreview(preview);
                  setDeleteAudio(true);
                }}
                onAudioRemove={() => {
                  setNewAudioFile(null);
                  setNewAudioPreview('');
                  setDeleteAudio(true);
                }}
                currentAudioFile={newAudioFile}
                currentAudioUrl={newAudioPreview}
                isEditMode={true}
              />
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-[#dfd2ba]">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-8 py-2.5 bg-[#25583f] hover:bg-[#317051] text-[#fff7d6] font-extrabold rounded-lg transition shadow-md text-sm border border-[#caa85d]"
          >
            {saving ? (isTamil ? 'சேமிக்கப்படுகிறது...' : 'Saving...') : (isTamil ? 'மாற்றங்களை சேமி' : 'Save Changes')}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto px-8 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-lg transition shadow-sm text-sm"
          >
            {isTamil ? 'ரத்துசெய்' : 'Cancel'}
          </button>
        </div>
      </form>
    </div>
  );
}
