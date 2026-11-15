import { Platform } from "react-native";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Purchases from "react-native-purchases";
import type { PurchasesPackage } from "react-native-purchases";
import { ENTITLEMENT } from "../domain/access";
// In-app purchases through RevenueCat (StoreKit / Google Play Billing).
// Keys come from app.json → expo.extra.revenueCat.{ios,android}. Without keys the app runs
// in free mode and the paywall says purchases are not available yet.
export type PlanId = "monthly" | "annual" | "lifetime";
export type Plan = { id: PlanId; price: string; pkg: PurchasesPackage };
const CACHE_KEY = "phraseuno.premium.v1";
const keys = (Constants.expoConfig?.extra?.revenueCat ?? {}) as { ios?: string; android?: string };
const apiKey = Platform.OS === "ios" ? keys.ios : Platform.OS === "android" ? keys.android : undefined;
export const purchasesConfigured = typeof apiKey === "string" && apiKey.length > 0;
const active = (info: { entitlements: { active: Record<string, unknown> } }) => !!info.entitlements.active[ENTITLEMENT];
/** Starts the SDK and reports the Premium state (cached value first, so access works offline). */
export async function initPurchases(onPremium: (premium: boolean) => void) {
  const cached = (await AsyncStorage.getItem(CACHE_KEY).catch(() => null)) === "1";
  onPremium(cached);
  if (!purchasesConfigured) return;
  const update = (premium: boolean) => { onPremium(premium); AsyncStorage.setItem(CACHE_KEY, premium ? "1" : "0").catch(() => {}); };
  try {
    Purchases.configure({ apiKey: apiKey as string });
    Purchases.addCustomerInfoUpdateListener((info) => update(active(info)));
    update(active(await Purchases.getCustomerInfo()));
  } catch { /* keep cached state; the store may be unreachable */ }
}
export async function loadPlans(): Promise<Plan[]> {
  if (!purchasesConfigured) return [];
  const offering = (await Purchases.getOfferings()).current;
  const entries: [PlanId, PurchasesPackage | null | undefined][] = [["annual", offering?.annual], ["monthly", offering?.monthly], ["lifetime", offering?.lifetime]];
  return entries.flatMap(([id, pkg]) => (pkg ? [{ id, price: pkg.product.priceString, pkg }] : []));
}
export async function buy(plan: Plan): Promise<"purchased" | "cancelled"> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(plan.pkg);
    return active(customerInfo) ? "purchased" : "cancelled";
  } catch (error) {
    if ((error as { userCancelled?: boolean }).userCancelled) return "cancelled";
    throw error;
  }
}
export async function restorePurchases() {
  if (!purchasesConfigured) return false;
  return active(await Purchases.restorePurchases());
}
