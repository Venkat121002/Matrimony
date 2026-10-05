import { findUsers, updateUser } from '../models/users.js';
import { sendMatchingProfileRecommendationEmail } from './emailService.js';

/**
 * Checks whether a new profile is compatible with a premium user's criteria.
 * - Premium Bride account receives suitable Groom account.
 * - Premium Groom account receives suitable Bride account.
 */
export const isProfileMatch = (premiumUser, newProfile) => {
  if (!premiumUser || !newProfile) return false;

  // 1. Must be strictly opposite gender
  if (premiumUser.gender === newProfile.gender) {
    return false;
  }

  // 2. Cannot match own account
  if (premiumUser._id === newProfile._id || premiumUser.nikahId === newProfile.nikahId) {
    return false;
  }

  // 3. Age compatibility
  const userAge = Number(premiumUser.age) || 25;
  const candidateAge = Number(newProfile.age) || 25;

  if (premiumUser.gender === 'bride') {
    // Bride looking for Groom: Groom is typically between bride.age - 2 and bride.age + 12
    if (candidateAge < userAge - 2 || candidateAge > userAge + 12) {
      return false;
    }
  } else {
    // Groom looking for Bride: Bride is typically between groom.age - 12 and groom.age + 2
    if (candidateAge > userAge + 2 || candidateAge < userAge - 12) {
      return false;
    }
  }

  // 4. Marital status compatibility
  const isNeverMarried = (status = '') => {
    const s = String(status).toLowerCase();
    return !status || s.includes('ஆகாதவர்') || s.includes('unmarried') || s.includes('never');
  };

  const userNeverMarried = isNeverMarried(premiumUser.maritalStatus);
  const candidateNeverMarried = isNeverMarried(newProfile.maritalStatus);

  // If premium user is never married, prefer never married candidates
  if (userNeverMarried && !candidateNeverMarried) {
    return false;
  }

  return true;
};

/**
 * Dispatches recommendation emails to all suitable premium members
 * whenever a new bride or groom registers or is approved.
 *
 * Premium Bride accounts receive suitable Groom accounts.
 * Premium Groom accounts receive suitable Bride accounts.
 */
export const notifyMatchingPremiumUsers = async (newProfile) => {
  try {
    if (!newProfile || !newProfile.gender) {
      return { success: false, reason: 'Invalid profile' };
    }

    const targetGender = newProfile.gender === 'groom' ? 'bride' : 'groom';

    // Find all active premium users of the opposite gender
    const premiumUsers = (await findUsers({ gender: targetGender, subscriptionStatus: 'premium' })).filter(
      (u) => u.isSuspended !== true && u._id !== newProfile._id
    );

    if (!premiumUsers || premiumUsers.length === 0) {
      console.log(`[Matching Service] No active premium ${targetGender} accounts to notify.`);
      return { success: true, count: 0, recipients: [] };
    }

    const matchedUsers = premiumUsers.filter((u) => isProfileMatch(u, newProfile));

    console.log(
      `[Matching Service] Found ${matchedUsers.length} compatible premium ${targetGender} accounts for new ${newProfile.gender} (${newProfile.nikahId})`
    );

    const emailPromises = matchedUsers.map(async (premiumUser) => {
      // Send notification if user has an email
      if (premiumUser.email) {
        try {
          await sendMatchingProfileRecommendationEmail(premiumUser, newProfile);
          console.log(
            `[Matching Service] Dispatched match recommendation to Premium ${premiumUser.gender}: ${premiumUser.email} (ID: ${premiumUser.nikahId})`
          );
          return { email: premiumUser.email, nikahId: premiumUser.nikahId, sent: true };
        } catch (err) {
          console.error(`[Matching Service Error] Failed sending to ${premiumUser.email}:`, err.message);
          return { email: premiumUser.email, nikahId: premiumUser.nikahId, sent: false, error: err.message };
        }
      }
      return { nikahId: premiumUser.nikahId, sent: false, reason: 'No email' };
    });

    const results = await Promise.all(emailPromises);

    // Update matchNotified flag if this is a stored profile
    if (newProfile._id) {
      await updateUser(newProfile, { matchNotified: true }).catch(() => {});
    }

    return {
      success: true,
      count: results.filter((r) => r.sent).length,
      recipients: results,
    };
  } catch (err) {
    console.error('[Matching Service Exception]:', err);
    return { success: false, error: err.message };
  }
};
