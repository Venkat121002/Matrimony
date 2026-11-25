import React, { useState, useEffect } from 'react';
import {
  FaTimes,
  FaShieldAlt,
  FaUsers,
  FaUserCheck,
  FaClock,
  FaMoneyBillWave,
  FaCheck,
  FaBan,
  FaFileAlt,
  FaEye,
  FaCrown,
  FaHeadset,
  FaSearch,
  FaFilter,
  FaReply,
  FaSync,
  FaReceipt,
  FaStar,
  FaCheckCircle,
  FaTimesCircle,
} from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';
import { useModalBackdrop } from '../hooks/useModalBackdrop';

export default function AdminDashboard({ isOpen, onClose, onRefreshProfiles }) {
  const { t, isTamil } = useLanguage();
  const { backdropProps, modalContentProps } = useModalBackdrop(onClose);
  const { backdropProps: kycBackdropProps, modalContentProps: kycModalProps } = useModalBackdrop(() => setSelectedKycDoc(null));
  const { backdropProps: rejectBackdropProps, modalContentProps: rejectModalProps } = useModalBackdrop(() => setRejectingUserId(null));
  const { backdropProps: proofPhotoBackdropProps, modalContentProps: proofPhotoModalProps } = useModalBackdrop(() => setSelectedProofPhoto(null));

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'verifications' | 'users' | 'support' | 'payments'
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Verifications State
  const [pendingQueue, setPendingQueue] = useState([]);
  const [selectedKycDoc, setSelectedKycDoc] = useState(null);
  const [rejectingUserId, setRejectingUserId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Users State
  const [usersList, setUsersList] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [userFilter, setUserFilter] = useState('all');

  // Support Tickets State
  const [ticketsList, setTicketsList] = useState([]);
  const [ticketReplyId, setTicketReplyId] = useState(null);
  const [adminReplyText, setAdminReplyText] = useState('');

  // Payment Proofs State
  const [paymentProofsList, setPaymentProofsList] = useState([]);
  const [proofFilter, setProofFilter] = useState('pending');
  const [proofSearch, setProofSearch] = useState('');
  const [selectedProofPhoto, setSelectedProofPhoto] = useState(null);
  const [rejectingProofId, setRejectingProofId] = useState(null);
  const [proofRejectReason, setProofRejectReason] = useState('');
  const [proofActionLoadingId, setProofActionLoadingId] = useState(null);

  // Fetch Dashboard Stats and Data
  const fetchDashboardData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const token = localStorage.getItem('nikah_token');
      if (!token) {
        setErrorMsg('Admin authorization token required.');
        setLoading(false);
        return;
      }

      // Fetch stats
      const statsRes = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const statsData = await statsRes.json();
      if (statsData.success) {
        setStats(statsData.stats);
      } else {
        setErrorMsg(statsData.message || 'Failed to load stats');
      }

      // Fetch verification queue
      const verRes = await fetch('/api/admin/verifications?status=pending', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const verData = await verRes.json();
      if (verData.success) {
        setPendingQueue(verData.users || []);
      }

      // Fetch users
      const usersRes = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const usersData = await usersRes.json();
      if (usersData.success) {
        setUsersList(usersData.users || []);
      }

      // Fetch tickets
      const ticketsRes = await fetch('/api/admin/tickets', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const ticketsData = await ticketsRes.json();
      if (ticketsData.success) {
        setTicketsList(ticketsData.tickets || []);
      }

      // Fetch payment proofs
      const proofsRes = await fetch('/api/admin/payment-proofs?status=all', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const proofsData = await proofsRes.json();
      if (proofsData.success) {
        setPaymentProofsList(proofsData.proofs || []);
      }
    } catch (err) {
      console.error('[Admin Dashboard Error]:', err);
      setErrorMsg('Error connecting to admin API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDashboardData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Approve Profile
  const handleApprove = async (userId) => {
    try {
      const token = localStorage.getItem('nikah_token');
      const res = await fetch(`/api/admin/verifications/${userId}/approve`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setPendingQueue((prev) => prev.filter((u) => u._id !== userId));
        fetchDashboardData();
        if (onRefreshProfiles) onRefreshProfiles();
      } else {
        alert(data.message || 'Approval failed');
      }
    } catch (e) {
      alert('Error approving profile');
    }
  };

  // Reject Profile
  const handleConfirmReject = async () => {
    if (!rejectingUserId) return;
    try {
      const token = localStorage.getItem('nikah_token');
      const res = await fetch(`/api/admin/verifications/${rejectingUserId}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: rejectionReason }),
      });
      const data = await res.json();
      if (data.success) {
        setPendingQueue((prev) => prev.filter((u) => u._id !== rejectingUserId));
        setRejectingUserId(null);
        setRejectionReason('');
        fetchDashboardData();
      } else {
        alert(data.message || 'Rejection failed');
      }
    } catch (e) {
      alert('Error rejecting profile');
    }
  };

  // Toggle Suspend User
  const handleToggleSuspend = async (userId, currentSuspended) => {
    try {
      const token = localStorage.getItem('nikah_token');
      const res = await fetch(`/api/admin/users/${userId}/suspend`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          suspend: !currentSuspended,
          reason: !currentSuspended ? 'Policy violation / incomplete profile' : '',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setUsersList((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, isSuspended: !currentSuspended } : u))
        );
      }
    } catch (e) {
      alert('Error changing user status');
    }
  };

  // Grant Premium to User
  const handleGrantPremium = async (userId) => {
    try {
      const token = localStorage.getItem('nikah_token');
      const res = await fetch(`/api/admin/users/${userId}/subscription`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ subscriptionStatus: 'premium', days: 365 }),
      });
      const data = await res.json();
      if (data.success) {
        setUsersList((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, subscriptionStatus: 'premium' } : u))
        );
        fetchDashboardData();
      }
    } catch (e) {
      alert('Error upgrading user');
    }
  };

  // Resolve Ticket
  const handleReplyTicket = async (ticketId) => {
    try {
      const token = localStorage.getItem('nikah_token');
      const res = await fetch(`/api/admin/tickets/${ticketId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: 'resolved',
          adminResponse: adminReplyText || 'Response provided via phone/email.',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTicketsList((prev) =>
          prev.map((t) =>
            t._id === ticketId
              ? { ...t, status: 'resolved', adminResponse: adminReplyText }
              : t
          )
        );
        setTicketReplyId(null);
        setAdminReplyText('');
      }
    } catch (e) {
      alert('Error updating ticket');
    }
  };

  // Approve Payment Proof
  const handleApprovePaymentProof = async (proof) => {
    try {
      setProofActionLoadingId(proof._id);
      const token = localStorage.getItem('nikah_token');
      const res = await fetch(`/api/admin/payment-proofs/${proof._id}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message || 'Payment proof approved and feature activated!');
        setPaymentProofsList((prev) =>
          prev.map((p) => (p._id === proof._id ? { ...p, status: 'approved' } : p))
        );
        fetchDashboardData();
        if (onRefreshProfiles) onRefreshProfiles();
      } else {
        alert(data.message || 'Failed to approve proof');
      }
    } catch (e) {
      alert('Error approving payment proof');
    } finally {
      setProofActionLoadingId(null);
    }
  };

  // Reject Payment Proof
  const handleRejectPaymentProof = async (proofId) => {
    try {
      setProofActionLoadingId(proofId);
      const token = localStorage.getItem('nikah_token');
      const res = await fetch(`/api/admin/payment-proofs/${proofId}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: proofRejectReason || 'Payment screenshot could not be verified.' }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Payment proof rejected.');
        setPaymentProofsList((prev) =>
          prev.map((p) => (p._id === proofId ? { ...p, status: 'rejected', rejectionReason: proofRejectReason } : p))
        );
        setRejectingProofId(null);
        setProofRejectReason('');
        fetchDashboardData();
      } else {
        alert(data.message || 'Failed to reject proof');
      }
    } catch (e) {
      alert('Error rejecting payment proof');
    } finally {
      setProofActionLoadingId(null);
    }
  };

  const filteredPaymentProofs = paymentProofsList.filter((p) => {
    if (proofFilter !== 'all' && p.status !== proofFilter) return false;
    if (proofSearch.trim()) {
      const q = proofSearch.toLowerCase().trim();
      const u = p.userSnapshot || p.userId || {};
      const nikahId = (u.nikahId || '').toLowerCase();
      const name = (u.fullName || '').toLowerCase();
      const phone = (u.phone || '').toLowerCase();
      const tx = (p.transactionId || '').toLowerCase();
      const plan = (p.planName || '').toLowerCase();
      return nikahId.includes(q) || name.includes(q) || phone.includes(q) || tx.includes(q) || plan.includes(q);
    }
    return true;
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-md overflow-y-auto animate-fadeIn"
      {...backdropProps}
    >
      <div
        className="w-full max-w-5xl bg-[#faf7ef] border-2 border-[#caa85d] rounded-2xl shadow-2xl overflow-hidden relative my-3 max-h-[94vh] flex flex-col"
        {...modalContentProps}
      >
        {/* Admin Header */}
        <div className="bg-gradient-to-r from-[#163828] via-[#21543c] to-[#163828] py-3.5 px-5 flex items-center justify-between border-b-2 border-[#caa85d] text-white flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center border-2 border-amber-300 shadow-sm flex-shrink-0 bg-white p-0.5">
              <img src="/logo.png" alt="Tamil Muslim Nikkah Logo" className="w-full h-full object-cover rounded-full" />
            </span>
            <div>
              <h2 className="font-extrabold text-base sm:text-lg text-[#fffae6] tracking-wide font-cinzel">
                TAMIL NIKAH ADMIN PANEL
              </h2>
              <p className="text-[11px] text-[#edd48e]">
                Identity Verification • User Administration • Subscription Limits & Revenue Desk
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchDashboardData}
              disabled={loading}
              className="p-1.5 rounded bg-white/10 hover:bg-white/20 text-[#edd48e] transition"
              title="Refresh"
            >
              <FaSync className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white p-1 text-base transition"
              aria-label="Close"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-[#ede4d1] border-b border-[#caa85d] px-4 py-2 flex flex-wrap gap-2 text-xs font-bold flex-shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'bg-[#163828] text-white shadow-sm'
                : 'text-[#44351b] hover:bg-[#dfd2ba]'
            }`}
          >
            <span>📊 Overview & Metrics</span>
          </button>
          <button
            onClick={() => setActiveTab('verifications')}
            className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 relative ${
              activeTab === 'verifications'
                ? 'bg-[#163828] text-white shadow-sm'
                : 'text-[#44351b] hover:bg-[#dfd2ba]'
            }`}
          >
            <span>🛡️ Verification Queue</span>
            {pendingQueue.length > 0 && (
              <span className="px-1.5 py-0.2 bg-red-600 text-white rounded-full text-[10px] animate-pulse">
                {pendingQueue.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'users'
                ? 'bg-[#163828] text-white shadow-sm'
                : 'text-[#44351b] hover:bg-[#dfd2ba]'
            }`}
          >
            <FaUsers />
            <span>User Management</span>
          </button>
          <button
            onClick={() => setActiveTab('support')}
            className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'support'
                ? 'bg-[#163828] text-white shadow-sm'
                : 'text-[#44351b] hover:bg-[#dfd2ba]'
            }`}
          >
            <FaHeadset />
            <span>Support Desk</span>
            {ticketsList.filter((t) => t.status === 'open').length > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-500 text-gray-900 font-extrabold rounded-full text-[10px]">
                {ticketsList.filter((t) => t.status === 'open').length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 relative ${
              activeTab === 'payments'
                ? 'bg-[#163828] text-white shadow-sm'
                : 'text-[#44351b] hover:bg-[#dfd2ba]'
            }`}
          >
            <FaReceipt />
            <span>Payment Proofs</span>
            {paymentProofsList.filter((p) => p.status === 'pending').length > 0 && (
              <span className="px-1.5 py-0.2 bg-red-600 text-white font-extrabold rounded-full text-[10px] animate-pulse">
                {paymentProofsList.filter((p) => p.status === 'pending').length}
              </span>
            )}
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-4 sm:p-5 flex-grow text-xs sm:text-sm">
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {/* TAB 1: OVERVIEW METRICS */}
          {activeTab === 'overview' && stats && (
            <div className="space-y-5 animate-fadeIn">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5">
                <div className="bg-white p-3 rounded-xl border border-[#caa85d]/60 shadow-xs text-center">
                  <FaUsers className="mx-auto text-lg text-[#163828] mb-1" />
                  <div className="text-lg sm:text-xl font-black text-gray-900">{stats.totalUsers}</div>
                  <div className="text-[10px] font-bold text-gray-500">Total Users</div>
                </div>

                <div className="bg-amber-50 p-3 rounded-xl border border-amber-300 shadow-xs text-center">
                  <FaClock className="mx-auto text-lg text-amber-600 mb-1" />
                  <div className="text-lg sm:text-xl font-black text-amber-700">{stats.pendingVerifications}</div>
                  <div className="text-[10px] font-bold text-amber-800">Pending KYC</div>
                </div>

                <div
                  onClick={() => setActiveTab('payments')}
                  className="bg-yellow-50 p-3 rounded-xl border-2 border-yellow-400 shadow-xs text-center cursor-pointer hover:bg-yellow-100 transition"
                >
                  <FaReceipt className="mx-auto text-lg text-yellow-700 mb-1" />
                  <div className="text-lg sm:text-xl font-black text-yellow-900">
                    {stats.pendingPaymentProofs ?? paymentProofsList.filter((p) => p.status === 'pending').length}
                  </div>
                  <div className="text-[10px] font-bold text-yellow-800">Pending Proofs</div>
                </div>

                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-300 shadow-xs text-center">
                  <FaUserCheck className="mx-auto text-lg text-emerald-600 mb-1" />
                  <div className="text-lg sm:text-xl font-black text-emerald-700">{stats.verifiedProfiles}</div>
                  <div className="text-[10px] font-bold text-emerald-800">Verified Live</div>
                </div>

                <div className="bg-purple-50 p-3 rounded-xl border border-purple-300 shadow-xs text-center">
                  <FaCrown className="mx-auto text-lg text-purple-600 mb-1" />
                  <div className="text-lg sm:text-xl font-black text-purple-700">{stats.activeSubscriptions}</div>
                  <div className="text-[10px] font-bold text-purple-800">Premium Members</div>
                </div>

                <div className="bg-blue-50 p-3 rounded-xl border border-blue-300 shadow-xs text-center">
                  <FaHeadset className="mx-auto text-lg text-blue-600 mb-1" />
                  <div className="text-lg sm:text-xl font-black text-blue-700">{stats.openTickets}</div>
                  <div className="text-[10px] font-bold text-blue-800">Open Tickets</div>
                </div>

                <div className="bg-[#163828] text-white p-3 rounded-xl border border-[#caa85d] shadow-xs text-center col-span-2 sm:col-span-1">
                  <FaMoneyBillWave className="mx-auto text-lg text-amber-400 mb-1" />
                  <div className="text-lg sm:text-xl font-black text-amber-300">₹{stats.totalRevenue.toLocaleString()}</div>
                  <div className="text-[10px] font-bold text-[#ecd08c]">Revenue (INR)</div>
                </div>
              </div>

              {/* Quick Actions & Pending Preview */}
              <div className="bg-white p-4 rounded-xl border border-[#dfd2ba] space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-sm text-[#163828] flex items-center gap-1.5">
                    <FaClock className="text-amber-600" />
                    <span>Immediate Action: Pending KYC Profiles Requiring Review ({pendingQueue.length})</span>
                  </h4>
                  <button
                    onClick={() => setActiveTab('verifications')}
                    className="text-xs font-bold text-[#8a6d2f] hover:underline"
                  >
                    View All in Queue →
                  </button>
                </div>

                {pendingQueue.length === 0 ? (
                  <div className="p-6 text-center text-gray-500 bg-gray-50 rounded-lg">
                    ✓ All identity documents have been reviewed. No pending verifications at this time!
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-[#f2ecdd] text-[#3d2f16] font-extrabold border-b border-[#dfd2ba]">
                          <th className="p-2.5">ID</th>
                          <th className="p-2.5">Name</th>
                          <th className="p-2.5">District</th>
                          <th className="p-2.5">Doc Type</th>
                          <th className="p-2.5">Uploaded</th>
                          <th className="p-2.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#eee4cf]">
                        {pendingQueue.slice(0, 4).map((user) => (
                          <tr key={user._id} className="hover:bg-amber-50/50">
                            <td className="p-2.5 font-bold text-[#163828]">{user.nikahId}</td>
                            <td className="p-2.5 font-semibold text-gray-900">{user.fullName}</td>
                            <td className="p-2.5 text-gray-700">{user.district}</td>
                            <td className="p-2.5">
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-bold text-[10px]">
                                {user.kycDocument?.docType || 'Aadhaar'}
                              </span>
                            </td>
                            <td className="p-2.5 text-gray-500 text-[11px]">
                              {new Date(user.kycDocument?.uploadedAt || user.createdAt).toLocaleDateString()}
                            </td>
                            <td className="p-2.5 text-right space-x-1.5">
                              <button
                                onClick={() => handleApprove(user._id)}
                                className="px-2.5 py-1 bg-green-700 text-white rounded font-bold hover:bg-green-800 text-xs shadow-xs"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => setRejectingUserId(user._id)}
                                className="px-2.5 py-1 bg-red-700 text-white rounded font-bold hover:bg-red-800 text-xs shadow-xs"
                              >
                                Reject
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: VERIFICATION QUEUE */}
          {activeTab === 'verifications' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-base text-[#163828]">
                  Identity Verification Queue ({pendingQueue.length} Pending)
                </h3>
                <span className="text-xs text-gray-600 font-medium">
                  Review genuine government IDs (Aadhaar / PAN / Passport) before gating approval
                </span>
              </div>

              {pendingQueue.length === 0 ? (
                <div className="bg-white p-8 rounded-xl border border-[#dfd2ba] text-center text-gray-600">
                  <FaUserCheck className="mx-auto text-4xl text-green-600 mb-2" />
                  <p className="font-bold text-base">Verification Queue Clear!</p>
                  <p className="text-xs text-gray-500">
                    All submitted profiles have been verified. Any newly registered profile will appear here immediately.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingQueue.map((user) => (
                    <div
                      key={user._id}
                      className="bg-white p-4 rounded-xl border-2 border-[#dfd2ba] shadow-sm space-y-3"
                    >
                      <div className="flex items-start justify-between border-b border-gray-100 pb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-[#8a6d2f] text-white rounded font-extrabold text-xs">
                              {user.nikahId}
                            </span>
                            <span className="font-extrabold text-sm text-[#163828]">
                              {user.fullName}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mt-0.5">
                            {user.gender === 'groom' ? 'மணமகன் (Groom)' : 'மணமகள் (Bride)'} • {user.age} yrs • {user.district}, {user.state}
                          </p>
                        </div>
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-bold text-[11px] border border-amber-300">
                          Pending KYC
                        </span>
                      </div>

                      {/* Profile details snippet */}
                      <div className="grid grid-cols-2 gap-2 text-xs bg-[#fbf9f2] p-2.5 rounded-lg border border-[#eee4cf]">
                        <div>
                          <span className="text-gray-500 font-medium">Education:</span>{' '}
                          <span className="font-bold text-gray-800">{user.education}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 font-medium">Occupation:</span>{' '}
                          <span className="font-bold text-gray-800">{user.occupation}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 font-medium">Phone:</span>{' '}
                          <span className="font-bold text-gray-800">{user.phone}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 font-medium">Email:</span>{' '}
                          <span className="font-bold text-gray-800">{user.email}</span>
                        </div>
                      </div>

                      {/* KYC Document Card */}
                      <div className="bg-[#ede4d1] p-3 rounded-lg border border-[#c5b597] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FaFileAlt className="text-[#8a6d2f] text-xl" />
                          <div>
                            <div className="font-bold text-xs text-[#2b1f0c]">
                              {user.kycDocument?.docType || 'Identity Document'} Proof
                            </div>
                            <div className="text-[10px] text-gray-600 font-mono">
                              {user.kycDocument?.originalName || user.kycDocument?.filename || 'Document uploaded'}
                            </div>
                          </div>
                        </div>

                        {user.kycDocument?.filename && (
                          <button
                            type="button"
                            onClick={() => setSelectedKycDoc(user.kycDocument.filename)}
                            className="px-2.5 py-1 bg-white border border-[#caa85d] text-[#163828] font-bold rounded text-xs flex items-center gap-1 hover:bg-[#f4ebd0] shadow-xs"
                          >
                            <FaEye />
                            <span>View ID</span>
                          </button>
                        )}
                      </div>

                      {/* Decision Buttons */}
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => handleApprove(user._id)}
                          className="flex-1 py-1.5 bg-green-700 hover:bg-green-800 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1 shadow-sm transition"
                        >
                          <FaCheck />
                          <span>Approve & Verify</span>
                        </button>
                        <button
                          onClick={() => setRejectingUserId(user._id)}
                          className="flex-1 py-1.5 bg-red-700 hover:bg-red-800 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1 shadow-sm transition"
                        >
                          <FaBan />
                          <span>Reject with Reason</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: USER MANAGEMENT */}
          {activeTab === 'users' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-extrabold text-base text-[#163828]">
                  Registered Matrimonial Users ({usersList.length})
                </h3>

                {/* Search Bar */}
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search by ID, name, district..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="pl-8 pr-3 py-1.5 text-xs bg-white border border-[#c5b597] rounded-md focus:outline-none focus:ring-1 focus:ring-[#8a6d2f] text-gray-800"
                    />
                    <FaSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                  </div>
                </div>
              </div>

              {/* Users Table */}
              <div className="bg-white rounded-xl border border-[#dfd2ba] overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#f2ecdd] text-[#3d2f16] font-extrabold border-b border-[#dfd2ba]">
                        <th className="p-3">Nikah ID</th>
                        <th className="p-3">Name</th>
                        <th className="p-3">District</th>
                        <th className="p-3">Gender</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Subscription</th>
                        <th className="p-3 text-right">Admin Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#eee4cf]">
                      {usersList
                        .filter((u) => {
                          if (!userSearch.trim()) return true;
                          const q = userSearch.toLowerCase();
                          return (
                            u.nikahId?.toLowerCase().includes(q) ||
                            u.fullName?.toLowerCase().includes(q) ||
                            u.district?.toLowerCase().includes(q) ||
                            u.email?.toLowerCase().includes(q)
                          );
                        })
                        .map((u) => (
                          <tr key={u._id} className="hover:bg-amber-50/50">
                            <td className="p-3 font-mono font-bold text-[#163828]">{u.nikahId}</td>
                            <td className="p-3 font-bold text-gray-900">{u.fullName}</td>
                            <td className="p-3 text-gray-700">{u.district}</td>
                            <td className="p-3 text-gray-700">
                              {u.gender === 'groom' ? 'Groom' : 'Bride'}
                            </td>
                            <td className="p-3">
                              {u.isVerified ? (
                                <span className="px-2 py-0.5 bg-green-100 text-green-800 font-bold rounded text-[10px]">
                                  ✓ Verified
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold rounded text-[10px]">
                                  Pending
                                </span>
                              )}
                              {u.isSuspended && (
                                <span className="ml-1 px-2 py-0.5 bg-red-100 text-red-800 font-bold rounded text-[10px]">
                                  Suspended
                                </span>
                              )}
                            </td>
                            <td className="p-3">
                              {u.subscriptionStatus === 'premium' ? (
                                <span className="px-2 py-0.5 bg-purple-100 text-purple-800 font-bold rounded text-[10px] flex items-center gap-1 w-max">
                                  <FaCrown className="text-amber-500" /> Premium
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-700 font-bold rounded text-[10px]">
                                  Free Trial (5 views)
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-right space-x-1.5">
                              {u.subscriptionStatus !== 'premium' && (
                                <button
                                  type="button"
                                  onClick={() => handleGrantPremium(u._id)}
                                  className="px-2 py-1 bg-amber-500 text-gray-950 font-bold rounded text-[10px] hover:bg-amber-400"
                                  title="Grant Annual Premium Membership"
                                >
                                  + Grant Premium
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleToggleSuspend(u._id, u.isSuspended)}
                                className={`px-2 py-1 rounded text-[10px] font-bold ${
                                  u.isSuspended
                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                    : 'bg-red-100 text-red-700 border border-red-300 hover:bg-red-200'
                                }`}
                              >
                                {u.isSuspended ? 'Unsuspend' : 'Suspend'}
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CUSTOMER SUPPORT DESK */}
          {activeTab === 'support' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-base text-[#163828]">
                  Customer Support Inquiries & Tickets ({ticketsList.length})
                </h3>
              </div>

              {ticketsList.length === 0 ? (
                <div className="bg-white p-8 rounded-xl border border-[#dfd2ba] text-center text-gray-500">
                  No support tickets found.
                </div>
              ) : (
                <div className="space-y-3">
                  {ticketsList.map((ticket) => (
                    <div
                      key={ticket._id}
                      className="bg-white p-4 rounded-xl border border-[#dfd2ba] shadow-xs space-y-2.5"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-bold text-sm text-[#163828]">{ticket.subject}</span>
                          <p className="text-xs text-gray-500">
                            From: <strong>{ticket.name}</strong> ({ticket.email} • {ticket.phone})
                          </p>
                        </div>
                        <span
                          className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${
                            ticket.status === 'resolved'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {ticket.status === 'resolved' ? '✓ Resolved' : 'Open Ticket'}
                        </span>
                      </div>

                      <div className="p-3 bg-[#fbf9f2] rounded-lg border border-[#eee4cf] text-xs text-gray-800">
                        {ticket.message}
                      </div>

                      {ticket.adminResponse && (
                        <div className="p-2.5 bg-green-50 border border-green-200 rounded-lg text-xs text-green-900">
                          <strong>Admin Response:</strong> {ticket.adminResponse}
                        </div>
                      )}

                      {ticket.status !== 'resolved' && (
                        <div className="pt-1 flex items-center gap-2">
                          {ticketReplyId === ticket._id ? (
                            <div className="w-full space-y-2">
                              <textarea
                                value={adminReplyText}
                                onChange={(e) => setAdminReplyText(e.target.value)}
                                placeholder="Type response note for customer..."
                                className="w-full p-2 text-xs border border-[#caa85d] rounded-md focus:outline-none"
                                rows={2}
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleReplyTicket(ticket._id)}
                                  className="px-3 py-1 bg-green-700 text-white font-bold rounded text-xs"
                                >
                                  Submit & Mark Resolved
                                </button>
                                <button
                                  onClick={() => setTicketReplyId(null)}
                                  className="px-3 py-1 bg-gray-200 text-gray-700 font-bold rounded text-xs"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setTicketReplyId(ticket._id);
                                setAdminReplyText('');
                              }}
                              className="px-3 py-1 bg-[#163828] text-white font-bold rounded text-xs flex items-center gap-1 hover:bg-[#21543c]"
                            >
                              <FaReply />
                              <span>Reply & Resolve</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: PAYMENT PROOFS VERIFICATION */}
          {activeTab === 'payments' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Header & Filter Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-[#dfd2ba]">
                <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
                  {[
                    { id: 'pending', label: 'Pending', count: paymentProofsList.filter((p) => p.status === 'pending').length, alert: true },
                    { id: 'all', label: 'All Proofs', count: paymentProofsList.length },
                    { id: 'approved', label: 'Approved', count: paymentProofsList.filter((p) => p.status === 'approved').length },
                    { id: 'rejected', label: 'Rejected', count: paymentProofsList.filter((p) => p.status === 'rejected').length },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setProofFilter(tab.id)}
                      className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition ${
                        proofFilter === tab.id
                          ? 'bg-[#163828] text-[#edd48e] shadow-xs'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span
                        className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                          tab.alert && tab.count > 0 ? 'bg-red-600 text-white animate-pulse' : 'bg-black/10'
                        }`}
                      >
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-64">
                  <FaSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                  <input
                    type="text"
                    value={proofSearch}
                    onChange={(e) => setProofSearch(e.target.value)}
                    placeholder="Search Nikah ID, Name, UTR..."
                    className="w-full pl-7 pr-3 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#caa85d]"
                  />
                  {proofSearch && (
                    <button
                      onClick={() => setProofSearch('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <FaTimes className="text-[10px]" />
                    </button>
                  )}
                </div>
              </div>

              {/* Proofs Cards */}
              {filteredPaymentProofs.length === 0 ? (
                <div className="p-8 text-center bg-white border border-[#dfd2ba] rounded-xl space-y-2 text-gray-500">
                  <FaReceipt className="text-3xl text-gray-300 mx-auto" />
                  <p className="font-bold text-gray-700">No payment proofs found</p>
                  <p className="text-xs">Uploaded screenshots for Subscriptions & Marquee will appear here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredPaymentProofs.map((proof) => {
                    const u = proof.userSnapshot || proof.userId || {};
                    const isMarquee = proof.planType === 'featured_marquee';
                    const isMonthly = proof.planType === 'monthly_subscription';
                    const isYearly = proof.planType === 'yearly_subscription';
                    const isPending = proof.status === 'pending';
                    const isApproved = proof.status === 'approved';
                    const isRejected = proof.status === 'rejected';

                    return (
                      <div
                        key={proof._id}
                        className={`p-4 bg-white rounded-xl border-2 transition shadow-xs flex flex-col md:flex-row gap-4 justify-between items-start ${
                          isPending
                            ? 'border-amber-300 bg-amber-50/20'
                            : isApproved
                            ? 'border-emerald-300 bg-emerald-50/10'
                            : 'border-red-200'
                        }`}
                      >
                        {/* Details */}
                        <div className="space-y-2 flex-1 w-full">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-black text-xs px-2 py-0.5 rounded bg-[#163828] text-[#edd48e]">
                              {u.nikahId || 'N/A'}
                            </span>
                            <span className="font-bold text-gray-900 text-sm">{u.fullName || 'User'}</span>
                            <span className="text-xs text-gray-500">{u.district || u.state || ''}</span>
                            <span className="text-xs font-mono text-gray-500">{u.phone}</span>
                          </div>

                          <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-200 flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              {isMarquee ? (
                                <FaStar className="text-amber-500 text-base" />
                              ) : (
                                <FaCrown className="text-amber-500 text-base" />
                              )}
                              <div>
                                <span className="font-bold text-gray-800 text-xs sm:text-sm">
                                  {isMarquee
                                    ? 'Featured in Marquee (15 Days)'
                                    : isMonthly
                                    ? 'Monthly Premium (30 Days)'
                                    : isYearly
                                    ? 'Annual Premium (1 Year)'
                                    : (proof.planName || 'Custom Plan')}
                                </span>
                                <div className="text-[11px] text-gray-500">
                                  <span>{new Date(proof.createdAt).toLocaleString()}</span>
                                  {proof.transactionId && (
                                    <span className="ml-2 font-mono text-purple-900 bg-purple-50 px-1.5 py-0.2 rounded border border-purple-200">
                                      UTR: <strong>{proof.transactionId}</strong>
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-base sm:text-lg font-black text-[#163828]">
                                ₹{proof.amount}
                              </span>
                            </div>
                          </div>

                          {proof.notes && (
                            <div className="text-xs text-gray-600 italic bg-gray-50 p-2 rounded border border-gray-200">
                              <strong>Note:</strong> "{proof.notes}"
                            </div>
                          )}

                          {isRejected && (
                            <div className="text-xs text-red-800 bg-red-100 p-2 rounded flex items-center gap-1 font-semibold">
                              <FaTimesCircle className="text-red-600" />
                              <span>Reason: {proof.rejectionReason}</span>
                            </div>
                          )}

                          {isApproved && (
                            <div className="text-xs text-emerald-800 bg-emerald-100 p-2 rounded flex items-center gap-1 font-semibold">
                              <FaCheckCircle className="text-emerald-600" />
                              <span>Approved and feature enabled</span>
                            </div>
                          )}

                          {isPending && (
                            <div className="pt-2 flex items-center gap-2">
                              {rejectingProofId === proof._id ? (
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <input
                                    type="text"
                                    value={proofRejectReason}
                                    onChange={(e) => setProofRejectReason(e.target.value)}
                                    placeholder="Rejection reason..."
                                    className="px-2 py-1 text-xs border border-red-300 rounded focus:outline-none w-44"
                                  />
                                  <button
                                    onClick={() => handleRejectPaymentProof(proof._id)}
                                    disabled={proofActionLoadingId === proof._id}
                                    className="px-3 py-1 bg-red-700 text-white rounded font-bold text-xs"
                                  >
                                    Confirm
                                  </button>
                                  <button
                                    onClick={() => {
                                      setRejectingProofId(null);
                                      setProofRejectReason('');
                                    }}
                                    className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleApprovePaymentProof(proof)}
                                    disabled={proofActionLoadingId === proof._id}
                                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs flex items-center gap-1"
                                  >
                                    <FaCheckCircle />
                                    <span>Approve & Enable</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setRejectingProofId(proof._id);
                                      setProofRejectReason('Payment screenshot could not be verified');
                                    }}
                                    disabled={proofActionLoadingId === proof._id}
                                    className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-300 rounded-lg font-bold text-xs flex items-center gap-1"
                                  >
                                    <FaTimesCircle />
                                    <span>Reject</span>
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Screenshot */}
                        <div className="w-full md:w-44 flex-shrink-0 flex flex-col items-center">
                          {proof.proofScreenshot ? (
                            <div
                              onClick={() => setSelectedProofPhoto(proof.proofScreenshot)}
                              className="w-full md:w-44 h-32 rounded-lg overflow-hidden border-2 border-gray-300 cursor-pointer relative group bg-black/5"
                            >
                              <img
                                src={proof.proofScreenshot}
                                alt="Payment Proof"
                                className="w-full h-full object-cover group-hover:scale-105 transition"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold gap-1">
                                <FaEye />
                                <span>Zoom</span>
                              </div>
                            </div>
                          ) : (
                            <div className="w-full md:w-44 h-32 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs">
                              No image
                            </div>
                          )}
                          {proof.proofScreenshot && (
                            <button
                              onClick={() => setSelectedProofPhoto(proof.proofScreenshot)}
                              className="mt-1 text-[11px] text-[#163828] font-bold underline hover:text-amber-800 flex items-center gap-1"
                            >
                              <FaEye className="text-[10px]" />
                              <span>View Full Size</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* KYC Document Viewer Modal */}
        {selectedKycDoc && (
          <div
            className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
            {...kycBackdropProps}
          >
            <div
              className="bg-white rounded-xl overflow-hidden max-w-2xl w-full max-h-[85vh] flex flex-col border-2 border-[#caa85d]"
              {...kycModalProps}
            >
              <div className="bg-[#163828] text-white p-3 flex justify-between items-center border-b border-[#caa85d]">
                <span className="font-bold text-sm">Secure Identity Document Preview</span>
                <button
                  onClick={() => setSelectedKycDoc(null)}
                  className="text-white hover:text-amber-300"
                >
                  <FaTimes />
                </button>
              </div>
              <div className="p-4 overflow-y-auto flex-grow bg-gray-100 flex items-center justify-center">
                <iframe
                  src={`/api/admin/documents/${selectedKycDoc}`}
                  title="Document Preview"
                  className="w-full h-96 border rounded bg-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* Reject Reason Prompt Modal */}
        {rejectingUserId && (
          <div
            className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn"
            {...rejectBackdropProps}
          >
            <div
              className="bg-white rounded-xl p-5 max-w-md w-full border-2 border-red-400 space-y-3"
              {...rejectModalProps}
            >
              <h4 className="font-extrabold text-sm text-red-800">
                Reject Verification & Notify User
              </h4>
              <p className="text-xs text-gray-600">
                Provide a clear reason so the user knows what to fix when re-uploading their document.
              </p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Document image is blurry or name does not match government ID."
                className="w-full p-2.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                rows={3}
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setRejectingUserId(null)}
                  className="px-3 py-1.5 bg-gray-200 text-gray-700 font-bold rounded text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmReject}
                  className="px-4 py-1.5 bg-red-700 hover:bg-red-800 text-white font-bold rounded text-xs"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payment Proof Photo Full Viewer Modal */}
        {selectedProofPhoto && (
          <div
            className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
            {...proofPhotoBackdropProps}
          >
            <div
              className="relative max-w-2xl w-full max-h-[90vh] flex flex-col items-center bg-[#163828] border-2 border-[#caa85d] rounded-2xl overflow-hidden shadow-2xl p-4"
              {...proofPhotoModalProps}
            >
              <div className="w-full flex items-center justify-between pb-3 text-white border-b border-[#caa85d]">
                <h3 className="font-cinzel font-bold text-sm text-[#edd48e] flex items-center gap-2">
                  <FaReceipt />
                  <span>Payment Proof Screenshot Preview</span>
                </h3>
                <button
                  onClick={() => setSelectedProofPhoto(null)}
                  className="text-white hover:text-amber-300 transition text-lg"
                >
                  <FaTimes />
                </button>
              </div>
              <div className="p-2 overflow-auto flex items-center justify-center w-full max-h-[75vh]">
                <img
                  src={selectedProofPhoto}
                  alt="Proof Full Size"
                  className="max-h-[72vh] max-w-full object-contain rounded-lg border border-[#caa85d]"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
