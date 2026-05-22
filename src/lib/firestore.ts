import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  increment,
  serverTimestamp,
  deleteDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import { hashPin } from "./hash";
import { generateReferralCode, generateRewardCode } from "./referral";
import type {
  Customer,
  Staff,
  StampLog,
  Settings,
  Reward,
  RewardCode,
  Campaign,
  Feedback,
} from "@/types";

function getSeconds(time: unknown): number {
  if (!time) return 0;
  if (time instanceof Date) return Math.floor(time.getTime() / 1000);
  const t = time as { seconds?: number; toDate?: () => Date };
  if (typeof t.seconds === "number") return t.seconds;
  if (typeof t.toDate === "function") return Math.floor(t.toDate().getTime() / 1000);
  return 0;
}

// ==================== CUSTOMERS ====================

export async function getCustomerByPhone(phone: string): Promise<Customer | null> {
  const q = query(
    collection(db, "customers"),
    where("phone", "==", phone),
    where("isDeleted", "==", false),
    limit(1)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const docSnap = snapshot.docs[0];
  return { id: docSnap.id, ...docSnap.data() } as Customer;
}

export async function getCustomerById(id: string): Promise<Customer | null> {
  const docRef = doc(db, "customers", id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as Customer;
}

export async function createCustomer(
  name: string,
  phone: string,
  email?: string,
  birthday?: Date | null,
  referredBy?: string | null
): Promise<Customer> {
  const referralCode = generateReferralCode();
  const now = Timestamp.now();

  const customerData: Omit<Customer, "id"> = {
    name,
    phone,
    email: email || null,
    stamps: 0,
    totalVisits: 0,
    lastVisit: now,
    rewardsClaimed: 0,
    createdAt: now,
    birthday: birthday ? Timestamp.fromDate(birthday) : null,
    referralCode,
    referredBy: referredBy || null,
    referralCount: 0,
    fcmToken: null,
    pushEnabled: false,
    isDeleted: false,
  };

  const docRef = await addDoc(collection(db, "customers"), customerData);
  return { id: docRef.id, ...customerData };
}

export async function getAllCustomers(): Promise<Customer[]> {
  const q = query(
    collection(db, "customers"),
    where("isDeleted", "==", false)
  );
  const snapshot = await getDocs(q);
  const customers = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Customer));
  return customers.sort((a, b) => {
    const aTime = getSeconds(a.createdAt);
    const bTime = getSeconds(b.createdAt);
    return bTime - aTime;
  });
}


export async function updateCustomerStamps(
  customerId: string,
  stampsDelta: number
): Promise<void> {
  const ref = doc(db, "customers", customerId);
  await updateDoc(ref, {
    stamps: increment(stampsDelta),
    totalVisits: increment(stampsDelta > 0 ? 1 : 0),
    lastVisit: serverTimestamp(),
  });
}

export async function resetCustomerStamps(customerId: string): Promise<void> {
  const ref = doc(db, "customers", customerId);
  await updateDoc(ref, { stamps: 0 });
}

export async function softDeleteCustomer(customerId: string): Promise<void> {
  const ref = doc(db, "customers", customerId);
  await updateDoc(ref, { isDeleted: true });
}

export async function updateCustomerFcmToken(
  customerId: string,
  token: string | null,
  enabled: boolean
): Promise<void> {
  const ref = doc(db, "customers", customerId);
  await updateDoc(ref, { fcmToken: token, pushEnabled: enabled });
}

export async function getCustomerByReferralCode(code: string): Promise<Customer | null> {
  const q = query(
    collection(db, "customers"),
    where("referralCode", "==", code),
    where("isDeleted", "==", false),
    limit(1)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Customer;
}

export async function addReferralBonus(
  referrerId: string,
  bonus: number
): Promise<void> {
  const ref = doc(db, "customers", referrerId);
  await updateDoc(ref, {
    stamps: increment(bonus),
    referralCount: increment(1),
  });
}

// ==================== STAFF ====================

export async function getStaffByPin(pin: string): Promise<Staff | null> {
  const hashedPin = await hashPin(pin);
  const q = query(
    collection(db, "staff"),
    where("pin", "==", hashedPin),
    where("isActive", "==", true),
    limit(1)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Staff;
}

export async function getAllStaff(): Promise<Staff[]> {
  const q = query(collection(db, "staff"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Staff));
}

export async function createStaff(name: string, pin: string): Promise<Staff> {
  const hashedPin = await hashPin(pin);
  const staffData: Omit<Staff, "id"> = {
    name,
    pin: hashedPin,
    totalStampsGiven: 0,
    isActive: true,
    createdAt: Timestamp.now(),
  };
  const docRef = await addDoc(collection(db, "staff"), staffData);
  return { id: docRef.id, ...staffData };
}

export async function updateStaffStatus(
  staffId: string,
  isActive: boolean
): Promise<void> {
  const ref = doc(db, "staff", staffId);
  await updateDoc(ref, { isActive });
}

export async function deleteStaff(staffId: string): Promise<void> {
  const ref = doc(db, "staff", staffId);
  await deleteDoc(ref);
}

export async function incrementStaffStamps(staffId: string): Promise<void> {
  const ref = doc(db, "staff", staffId);
  await updateDoc(ref, { totalStampsGiven: increment(1) });
}

// ==================== STAMP LOGS ====================

export async function addStampLog(
  customerId: string,
  staffId: string,
  type: StampLog["type"],
  customerName?: string,
  staffName?: string,
  adminNote?: string
): Promise<void> {
  await addDoc(collection(db, "stampLogs"), {
    customerId,
    staffId,
    customerName: customerName || "",
    staffName: staffName || "",
    timestamp: serverTimestamp(),
    type,
    adminNote: adminNote || null,
  });
}

export async function getStampLogs(
  limitCount: number = 100
): Promise<StampLog[]> {
  const q = query(
    collection(db, "stampLogs"),
    orderBy("timestamp", "desc"),
    limit(limitCount)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as StampLog));
}

export async function getStampLogsByDate(
  startDate: Date,
  endDate: Date
): Promise<StampLog[]> {
  const q = query(
    collection(db, "stampLogs"),
    where("timestamp", ">=", Timestamp.fromDate(startDate)),
    where("timestamp", "<=", Timestamp.fromDate(endDate)),
    orderBy("timestamp", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as StampLog));
}

// ==================== SETTINGS ====================

export async function getSettings(): Promise<Settings> {
  const docRef = doc(db, "settings", "main");
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    // Return defaults
    const defaults: Settings = {
      stampsRequired: 10,
      rewardDescription: "Bedava Kahve ☕",
      googleMapsUrl: "",
      referralBonus: 2,
      businessName: "Holycon Kafe",
      businessPhone: "",
    };
    await setDoc(docRef, defaults);
    return defaults;
  }
  return docSnap.data() as Settings;
}

export async function updateSettings(
  settings: Partial<Settings>
): Promise<void> {
  const docRef = doc(db, "settings", "main");
  await setDoc(docRef, settings, { merge: true });
}

// ==================== REWARDS ====================

export async function getRewards(): Promise<Reward[]> {
  const q = query(collection(db, "rewards"), orderBy("stampsRequired", "asc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Reward));
}

export async function getActiveRewards(): Promise<Reward[]> {
  const q = query(
    collection(db, "rewards"),
    where("isActive", "==", true)
  );
  const snapshot = await getDocs(q);
  const rewards = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Reward));
  return rewards.sort((a, b) => a.stampsRequired - b.stampsRequired);
}


export async function createReward(reward: Omit<Reward, "id">): Promise<Reward> {
  const docRef = await addDoc(collection(db, "rewards"), reward);
  return { id: docRef.id, ...reward };
}

export async function updateReward(
  rewardId: string,
  data: Partial<Reward>
): Promise<void> {
  const ref = doc(db, "rewards", rewardId);
  await updateDoc(ref, data);
}

export async function deleteReward(rewardId: string): Promise<void> {
  const ref = doc(db, "rewards", rewardId);
  await deleteDoc(ref);
}

// ==================== REWARD CODES ====================

export async function createRewardCode(
  customerId: string,
  customerName: string,
  rewardId?: string,
  rewardTitle?: string
): Promise<RewardCode> {
  const code = generateRewardCode();
  const now = Timestamp.now();
  const expiresAt = new Date(now.toDate().getTime() + 10 * 60 * 1000); // 10 min

  const codeData: Omit<RewardCode, "id"> = {
    code,
    customerId,
    customerName,
    rewardId: rewardId || "",
    rewardTitle: rewardTitle || "",
    createdAt: now,
    expiresAt: Timestamp.fromDate(expiresAt),
    isUsed: false,
    usedAt: null,
  };

  const docRef = await addDoc(collection(db, "rewardCodes"), codeData);
  return { id: docRef.id, ...codeData };
}

export async function verifyAndUseRewardCode(
  code: string,
  staffId: string
): Promise<{ success: boolean; rewardCode?: RewardCode; error?: string }> {
  const q = query(
    collection(db, "rewardCodes"),
    where("code", "==", code),
    where("isUsed", "==", false),
    limit(1)
  );
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return { success: false, error: "Geçersiz kod" };
  }

  const rewardCodeDoc = snapshot.docs[0];
  const rewardCode = { id: rewardCodeDoc.id, ...rewardCodeDoc.data() } as RewardCode;

  // Check expiration
  const now = new Date();
  const expiresAt = (rewardCode.expiresAt as Timestamp).toDate();
  if (now > expiresAt) {
    return { success: false, error: "Kod süresi dolmuş" };
  }

  // Mark as used
  await updateDoc(doc(db, "rewardCodes", rewardCodeDoc.id), {
    isUsed: true,
    usedAt: serverTimestamp(),
    usedByStaffId: staffId,
  });

  // Reset customer stamps and increment rewards claimed
  const customerRef = doc(db, "customers", rewardCode.customerId);
  await updateDoc(customerRef, {
    stamps: 0,
    rewardsClaimed: increment(1),
  });

  // Log the reward claim
  await addStampLog(
    rewardCode.customerId,
    staffId,
    "reward_claimed",
    rewardCode.customerName
  );

  return { success: true, rewardCode };
}

// ==================== CAMPAIGNS ====================

export async function getCampaigns(): Promise<Campaign[]> {
  const q = query(
    collection(db, "campaigns"),
    orderBy("createdAt", "desc"),
    limit(50)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Campaign));
}

export async function createCampaign(
  campaign: Omit<Campaign, "id">
): Promise<Campaign> {
  const docRef = await addDoc(collection(db, "campaigns"), campaign);
  return { id: docRef.id, ...campaign };
}

export async function getCustomersBySegment(
  segment: string
): Promise<Customer[]> {
  const q = query(
    collection(db, "customers"),
    where("isDeleted", "==", false)
  );
  const snapshot = await getDocs(q);
  const customers = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Customer));
  
  const now = new Date();

  switch (segment) {
    case "inactive_14_days": {
      const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      return customers
        .filter((c) => {
          if (!c.lastVisit) return true;
          const visitDate = (c.lastVisit as Timestamp).toDate();
          return visitDate <= fourteenDaysAgo;
        })
        .sort((a, b) => {
          const aTime = getSeconds(a.lastVisit);
          const bTime = getSeconds(b.lastVisit);
          return bTime - aTime;
        });
    }
    case "no_rewards":
      return customers
        .filter((c) => c.rewardsClaimed === 0)
        .sort((a, b) => {
          const aTime = getSeconds(a.createdAt);
          const bTime = getSeconds(b.createdAt);
          return bTime - aTime;
        });
    case "all_customers":
    default:
      return customers.sort((a, b) => {
        const aTime = getSeconds(a.createdAt);
        const bTime = getSeconds(b.createdAt);
        return bTime - aTime;
      });
  }
}


// ==================== FEEDBACK ====================

export async function submitFeedback(
  customerId: string,
  customerName: string,
  customerPhone: string,
  rating: number,
  message: string
): Promise<void> {
  await addDoc(collection(db, "feedback"), {
    customerId,
    customerName,
    customerPhone,
    rating,
    message,
    createdAt: serverTimestamp(),
    isRead: false,
  });
}

export async function getFeedback(): Promise<Feedback[]> {
  const q = query(
    collection(db, "feedback"),
    orderBy("createdAt", "desc"),
    limit(50)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Feedback));
}

export async function markFeedbackRead(feedbackId: string): Promise<void> {
  const ref = doc(db, "feedback", feedbackId);
  await updateDoc(ref, { isRead: true });
}
