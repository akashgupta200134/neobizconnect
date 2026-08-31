import { colors, radius, spacing, txtSize, typography } from "@/constants/theme";
import { useAuthStore } from "@/store/auth.store";
import { useCartStore } from "@/store/cart.store";
import { Feather } from "@react-native-vector-icons/feather";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    ToastAndroid,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchUserProfile, submitSalesOrder } from "../services/products.api";
import { BillToAddress, OrderPayload, ShipToAddress } from "../types";

export const CheckoutScreen = () => {
    const router = useRouter();
    const user = useAuthStore((state) => state.user);
    const { items, getTotalUnits, getSubtotal, clearCart, selectedBrand } = useCartStore();

    const [selectedBillTo, setSelectedBillTo] = useState<BillToAddress | null>(null);
    const [selectedShipTo, setSelectedShipTo] = useState<ShipToAddress | null>(null);

    const groupCompanyName = user?.group_company_name || "Neo";

    const { data: profile, isLoading } = useQuery({
        queryKey: ["user-profile", groupCompanyName],
        queryFn: () => fetchUserProfile(groupCompanyName),
        enabled: Boolean(groupCompanyName),
    });

    const { mutate: submitOrder, isPending } = useMutation({
        mutationFn: submitSalesOrder,
        onSuccess: (data) => {
            ToastAndroid.show("Order placed successfully", ToastAndroid.SHORT);
            clearCart();
            router.replace("/(app)/(tabs)");
        },
        onError: (error) => {
            ToastAndroid.show("Failed to place order. Please try again.", ToastAndroid.LONG);
            console.error(error);
        },
    });

    const handleSubmit = () => {
        if (!selectedBillTo || !selectedShipTo || !selectedBrand) return;

        const payload: OrderPayload = {
            brand: selectedBrand.toUpperCase(),
            PayToCode: selectedBillTo.bill_to_addressname,
            ShipToCode: selectedShipTo.ship_to_addressname,
            DocumentLines: items.map((item) => ({
                ItemCode: item.itemCode,
                Quantity: item.quantity,
                UnitPrice: 0,
            })),
        };

        submitOrder(payload);
    };

    const isSubmitDisabled = !selectedBillTo || !selectedShipTo || isPending;

    if (isLoading) {
        return (
            <SafeAreaView style={[styles.safeArea, styles.centerBox]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Feather name="arrow-left" size={20} color={colors.textSecondary} />
                    <Text style={styles.backText}>Back to order summary</Text>
                </TouchableOpacity>

                <Text style={styles.screenTitle}>Select Address</Text>
                <Text style={styles.screenSubtitle}>
                    Choose a billing and shipping address to complete your order.
                </Text>

                {/* Billing Section */}
                <View style={styles.sectionHeader}>
                    <View style={[styles.iconBox, { backgroundColor: "#F3E8FF" }]}>
                        <Feather name="file-text" size={16} color="#9333EA" />
                    </View>
                    <View>
                        <Text style={styles.sectionTitle}>Billing Address</Text>
                        <Text style={styles.sectionSubtitle}>Where the invoice will be raised</Text>
                    </View>
                </View>

                <View style={styles.addressList}>
                    {profile?.bill_to.map((address, index) => {
                        const isSelected = selectedBillTo?.bill_to_addressname === address.bill_to_addressname;
                        return (
                            <TouchableOpacity
                                key={`bill-${index}`}
                                style={[styles.addressCard, isSelected && styles.addressCardSelected]}
                                activeOpacity={0.7}
                                onPress={() => setSelectedBillTo(address)}
                            >
                                <View style={styles.radioContainer}>
                                    <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                                        {isSelected && <View style={styles.radioInner} />}
                                    </View>
                                </View>
                                <View style={styles.addressContent}>
                                    <Text style={styles.addressName}>{address.bill_to_addressname}</Text>

                                    <View style={styles.addressLineRow}>
                                        <Feather name="map-pin" size={14} color={colors.muted} style={styles.addressIcon} />
                                        <Text style={styles.addressText}>{address.bill_to_address}</Text>
                                    </View>

                                    {address.bill_to_gstin ? (
                                        <View style={styles.addressLineRow}>
                                            <Feather name="file" size={14} color={colors.muted} style={styles.addressIcon} />
                                            <Text style={styles.gstinText}>GSTIN: {address.bill_to_gstin}</Text>
                                        </View>
                                    ) : null}
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Shipping Section */}
                <View style={[styles.sectionHeader, { marginTop: spacing.xl }]}>
                    <View style={[styles.iconBox, { backgroundColor: "#DCFCE7" }]}>
                        <Feather name="truck" size={16} color={colors.success} />
                    </View>
                    <View>
                        <Text style={styles.sectionTitle}>Shipping Address</Text>
                        <Text style={styles.sectionSubtitle}>Where the wheels will be delivered</Text>
                    </View>
                </View>

                <View style={styles.addressList}>
                    {profile?.ship_to.map((address, index) => {
                        const isSelected = selectedShipTo?.ship_to_addressname === address.ship_to_addressname;
                        return (
                            <TouchableOpacity
                                key={`ship-${index}`}
                                style={[styles.addressCard, isSelected && styles.addressCardSelected]}
                                activeOpacity={0.7}
                                onPress={() => setSelectedShipTo(address)}
                            >
                                <View style={styles.radioContainer}>
                                    <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                                        {isSelected && <View style={styles.radioInner} />}
                                    </View>
                                </View>
                                <View style={styles.addressContent}>
                                    <Text style={styles.addressName}>{address.ship_to_addressname}</Text>

                                    <View style={styles.addressLineRow}>
                                        <Feather name="map-pin" size={14} color={colors.muted} style={styles.addressIcon} />
                                        <Text style={styles.addressText}>{address.ship_to_address}</Text>
                                    </View>

                                    {address.ship_to_gstin ? (
                                        <View style={styles.addressLineRow}>
                                            <Feather name="file" size={14} color={colors.muted} style={styles.addressIcon} />
                                            <Text style={styles.gstinText}>GSTIN: {address.ship_to_gstin}</Text>
                                        </View>
                                    ) : null}
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Order Summary Footer */}
                <View style={styles.paymentSummaryCard}>
                    <Text style={styles.summaryTitle}>Order Total</Text>

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Total units</Text>
                        <Text style={styles.summaryValue}>{getTotalUnits()}</Text>
                    </View>

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Subtotal (Pre GST)</Text>
                        <Text style={styles.summaryValue}>₹{getSubtotal().toLocaleString("en-IN")}</Text>
                    </View>

                    <View style={styles.dashedLine} />

                    <View style={styles.grandTotalRow}>
                        <Text style={styles.grandTotalLabel}>Grand Total (Pre GST)</Text>
                        <Text style={styles.grandTotalValue}>₹{getSubtotal().toLocaleString("en-IN")}</Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.checkoutButton, isSubmitDisabled && styles.checkoutButtonDisabled]}
                        activeOpacity={0.8}
                        disabled={isSubmitDisabled}
                        onPress={handleSubmit}
                    >
                        {isPending ? (
                            <ActivityIndicator color={colors.white} />
                        ) : (
                            <Text style={styles.checkoutButtonText}>Submit Requirements</Text>
                        )}
                    </TouchableOpacity>

                    {isSubmitDisabled && !isPending && (
                        <Text style={styles.helperText}>
                            Select both a billing and shipping address to continue.
                        </Text>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.surface },
    centerBox: { justifyContent: "center", alignItems: "center" },
    container: { flex: 1 },
    scrollContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.xl },
    backButton: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: spacing.lg },
    backText: { fontSize: txtSize.small, fontFamily: typography.medium, color: colors.textSecondary },
    screenTitle: { fontSize: 28, fontFamily: typography.bold, color: colors.text, marginBottom: 8 },
    screenSubtitle: { fontSize: txtSize.small, fontFamily: typography.regular, color: colors.textSecondary, lineHeight: 20, marginBottom: spacing.xl },
    sectionHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: spacing.md },
    iconBox: { width: 36, height: 36, borderRadius: radius.sm, alignItems: "center", justifyContent: "center" },
    sectionTitle: { fontSize: txtSize.body, fontFamily: typography.bold, color: colors.text },
    sectionSubtitle: { fontSize: 12, fontFamily: typography.regular, color: colors.muted, marginTop: 2 },
    addressList: { gap: spacing.md },
    addressCard: { flexDirection: "row", padding: spacing.md, backgroundColor: colors.white, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
    addressCardSelected: { borderColor: colors.primary, backgroundColor: "#FEF2F2" },
    radioContainer: { marginRight: spacing.md, paddingTop: 2 },
    radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
    radioOuterSelected: { borderColor: colors.primary },
    radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
    addressContent: { flex: 1, gap: 6 },
    addressName: { fontSize: txtSize.small, fontFamily: typography.bold, color: colors.text, marginBottom: 4 },
    addressLineRow: { flexDirection: "row", alignItems: "flex-start", paddingRight: spacing.md },
    addressIcon: { marginTop: 2, marginRight: 6 },
    addressText: { flex: 1, fontSize: 13, fontFamily: typography.regular, color: colors.textSecondary, lineHeight: 18 },
    gstinText: { fontSize: 13, fontFamily: typography.medium, color: colors.textSecondary },
    paymentSummaryCard: { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.lg, marginTop: spacing.xxl, borderWidth: 1, borderColor: colors.border },
    summaryTitle: { fontSize: txtSize.body, fontFamily: typography.bold, color: colors.text, marginBottom: spacing.md },
    summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.sm },
    summaryLabel: { fontSize: txtSize.small, fontFamily: typography.regular, color: colors.textSecondary },
    summaryValue: { fontSize: txtSize.small, fontFamily: typography.medium, color: colors.text },
    dashedLine: { height: 1, borderColor: colors.border, borderWidth: 1, borderStyle: "dashed", marginVertical: spacing.md },
    grandTotalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.xl },
    grandTotalLabel: { fontSize: txtSize.body, fontFamily: typography.bold, color: colors.text },
    grandTotalValue: { fontSize: 20, fontFamily: typography.bold, color: colors.text },
    checkoutButton: { backgroundColor: colors.primary, alignItems: "center", justifyContent: "center", paddingVertical: 14, borderRadius: radius.md },
    checkoutButtonDisabled: { backgroundColor: colors.border },
    checkoutButtonText: { color: colors.white, fontSize: txtSize.body, fontFamily: typography.bold },
    helperText: { textAlign: "center", fontSize: 12, fontFamily: typography.medium, color: colors.muted, marginTop: spacing.md },
});