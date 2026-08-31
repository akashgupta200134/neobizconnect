import { colors, radius, spacing, txtSize, typography } from "@/constants/theme";
import { useCartStore } from "@/store/cart.store";
import { LegendList } from "@legendapp/list/react-native";
import { Feather } from "@react-native-vector-icons/feather";
import { useRouter } from "expo-router";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export const CartScreen = () => {
  const router = useRouter();
  const { items, updateQuantity, removeFromCart, getTotalUnits, getSubtotal } = useCartStore();

  const totalUnits = getTotalUnits();
  const subtotal = getSubtotal();

  const navigate = useRouter()

  const renderCartItem = ({ item }: { item: any }) => (
    <View style={styles.cartItemRow}>
      <View style={styles.itemImageContainer}>
        <Feather name="disc" size={32} color={colors.textSecondary} />
      </View>

      <View style={styles.itemDetails}>
        <Text style={styles.itemName} numberOfLines={2}>{item.itemName}</Text>
        <Text style={styles.itemCode}>{item.itemCode}</Text>

        <View style={styles.stockBadge}>
          <View style={styles.stockDot} />
          <Text style={styles.stockBadgeText}>{item.inStockQty} in stock</Text>
        </View>

        <Text style={styles.unitPrice}>₹{item.price.toLocaleString("en-IN")} <Text style={styles.unitLabel}>/ unit</Text></Text>
      </View>

      <View style={styles.itemActions}>
        <View style={styles.stepperContainer}>
          <TouchableOpacity
            style={styles.stepperButton}
            onPress={() => updateQuantity(item.id, item.quantity - 1)}
          >
            <Feather name="minus" size={14} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.stepperValue}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.stepperButton}
            onPress={() => updateQuantity(item.id, item.quantity + 1)}
          >
            <Feather name="plus" size={14} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.priceAndTrash}>
          <Text style={styles.totalItemPrice}>
            ₹{(item.price * item.quantity).toLocaleString("en-IN")}
          </Text>
          <TouchableOpacity
            onPress={() => removeFromCart(item.id)}
            hitSlop={8}
          >
            <Feather name="trash-2" size={18} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color={colors.textSecondary} />
          <Text style={styles.backText}>Back to catalogue</Text>
        </TouchableOpacity>

        <Text style={styles.screenTitle}>Order Summary</Text>
        <Text style={styles.screenSubtitle}>
          Review your items and adjust quantities before choosing a delivery address.
        </Text>
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="shopping-cart" size={48} color={colors.muted} />
          <Text style={styles.emptyText}>Your cart is empty</Text>
        </View>
      ) : (
        <View style={styles.contentContainer}>
          {/* Scrollable Items List */}
          <View style={styles.listContainer}>
            <View style={styles.itemsCard}>
              <View style={styles.itemsHeader}>
                <Text style={styles.itemsCountTitle}>Items <Text style={styles.itemsCount}>({items.length})</Text></Text>
                <View style={styles.brandBadge}>
                  <Text style={styles.brandBadgeText}>Brand: NEO</Text>
                </View>
              </View>

              <LegendList
                data={items}
                keyExtractor={(item: any) => item.id.toString()}
                renderItem={renderCartItem}
                estimatedItemSize={120}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.flatListContent}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                recycleItems={true}
              />
            </View>
          </View>

          {/* Sticky Payment Summary */}
          <View style={styles.paymentSummaryCard}>
            <Text style={styles.summaryTitle}>Payment Summary</Text>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total units</Text>
              <Text style={styles.summaryValue}>{totalUnits}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal (Pre GST)</Text>
              <Text style={styles.summaryValue}>₹{subtotal.toLocaleString("en-IN")}</Text>
            </View>

            <View style={styles.dashedLine} />

            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>Grand Total (Pre GST)</Text>
              <Text style={styles.grandTotalValue}>₹{subtotal.toLocaleString("en-IN")}</Text>
            </View>

            <TouchableOpacity onPress={() => navigate.push("/checkout")} style={styles.checkoutButton} activeOpacity={0.8}>
              <Text style={styles.checkoutButtonText}>Select Address</Text>
              <Feather name="arrow-right" size={18} color={colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: spacing.lg,
  },
  backText: {
    fontSize: txtSize.small,
    fontFamily: typography.medium,
    color: colors.textSecondary,
  },
  screenTitle: {
    fontSize: 28,
    fontFamily: typography.bold,
    color: colors.text,
    marginBottom: 8,
  },
  screenSubtitle: {
    fontSize: txtSize.small,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    marginTop: spacing.md,
    fontSize: txtSize.body,
    fontFamily: typography.medium,
    color: colors.muted,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  listContainer: {
    flex: 1,
  },
  itemsCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    flex: 1,
  },
  itemsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemsCountTitle: {
    fontSize: txtSize.body,
    fontFamily: typography.bold,
    color: colors.text,
  },
  itemsCount: {
    color: colors.textSecondary,
    fontFamily: typography.regular,
  },
  brandBadge: {
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radius.xl,
  },
  brandBadgeText: {
    fontSize: 12,
    fontFamily: typography.medium,
    color: colors.textSecondary,
  },
  flatListContent: {
    flexGrow: 1,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
  },
  cartItemRow: {
    flexDirection: "row",
    padding: spacing.md,
    gap: spacing.md,
  },
  itemImageContainer: {
    width: 60,
    height: 60,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: txtSize.small,
    fontFamily: typography.bold,
    color: colors.text,
    marginBottom: 2,
  },
  itemCode: {
    fontSize: 12,
    fontFamily: typography.regular,
    color: colors.muted,
    marginBottom: 8,
  },
  stockBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.xl,
    gap: 6,
    marginBottom: 8,
  },
  stockDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
  },
  stockBadgeText: {
    fontSize: 10,
    fontFamily: typography.medium,
    color: colors.success,
  },
  unitPrice: {
    fontSize: txtSize.small,
    fontFamily: typography.bold,
    color: colors.text,
  },
  unitLabel: {
    fontSize: 12,
    fontFamily: typography.regular,
    color: colors.muted,
  },
  itemActions: {
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  stepperContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
  },
  stepperButton: {
    padding: 8,
  },
  stepperValue: {
    paddingHorizontal: 12,
    fontSize: txtSize.small,
    fontFamily: typography.bold,
    color: colors.text,
  },
  priceAndTrash: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  totalItemPrice: {
    fontSize: txtSize.body,
    fontFamily: typography.bold,
    color: colors.text,
  },
  paymentSummaryCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryTitle: {
    fontSize: txtSize.body,
    fontFamily: typography.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    fontSize: txtSize.small,
    fontFamily: typography.regular,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: txtSize.small,
    fontFamily: typography.medium,
    color: colors.text,
  },
  dashedLine: {
    height: 1,
    borderColor: colors.border,
    borderWidth: 1,
    borderStyle: "dashed",
    marginVertical: spacing.md,
  },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  grandTotalLabel: {
    fontSize: txtSize.body,
    fontFamily: typography.bold,
    color: colors.text,
  },
  grandTotalValue: {
    fontSize: 20,
    fontFamily: typography.bold,
    color: colors.text,
  },
  checkoutButton: {
    backgroundColor: "#0F172A",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: radius.md,
    gap: 8,
  },
  checkoutButtonText: {
    color: colors.white,
    fontSize: txtSize.body,
    fontFamily: typography.bold,
  },
});