import { colors, radius, spacing, txtSize, typography } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";
import { useCartStore } from "@/store/cart.store";
import { LegendList } from "@legendapp/list/react-native";
import { Feather } from "@react-native-vector-icons/feather";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDealerProducts } from "../hooks/use-products";
import { SapProduct, StockFilterType, ViewMode } from "../types";

const SIZES = [
    { label: "All Sizes", value: "all" },
    { label: "12 Inch", value: "12" },
    { label: "13 Inch", value: "13" },
    { label: "14 Inch", value: "14" },
    { label: "15 Inch", value: "15" },
    { label: "16 Inch", value: "16" },
    { label: "17 Inch", value: "17" },
    { label: "18 Inch", value: "18" },
];

const STOCK_OPTIONS: { label: string; value: StockFilterType }[] = [
    { label: "In Stock", value: "inStock" },
    { label: "Out Of Stock", value: "outOfStock" },
    { label: "Offer Price", value: "offerPrice" },
];

export const DealerProductsScreen = () => {
    const router = useRouter();
    const { items: cartItems, addToCart, updateQuantity, selectedBrand, setSelectedBrand } = useCartStore();
    const [stockType, setStockType] = useState<StockFilterType>("inStock");
    const [wheelSize, setWheelSize] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<ViewMode>("grid");

    const [brandModalVisible, setBrandModalVisible] = useState(false);
    const [stockModalVisible, setStockModalVisible] = useState(false);
    const [sizeModalVisible, setSizeModalVisible] = useState(false);

    const { user } = useAuth()


    useEffect(() => {
        if (user?.dealer_brand_type) {
            if (user.dealer_brand_type.length === 1) {
                setSelectedBrand(user.dealer_brand_type[0]);
            } else if (!selectedBrand) {
                setBrandModalVisible(true);
            }
        }
    }, [user]);

    const { data: products = [], isLoading, isRefetching, refetch } = useDealerProducts({
        stockType,
        wheelSize,
        brand: selectedBrand || "Neo",
    });

    const filteredProducts = useMemo(() => {
        if (!searchQuery.trim()) return products;
        const query = searchQuery.toLowerCase().trim();
        return products.filter(
            (item) =>
                item.itemName.toLowerCase().includes(query) ||
                item.itemCode.toLowerCase().includes(query)
        );
    }, [products, searchQuery]);

    const handleReset = () => {
        setStockType("inStock");
        setWheelSize("all");
        setSearchQuery("");
    };

    const selectedStockLabel = STOCK_OPTIONS.find((s) => s.value === stockType)?.label;
    const selectedSizeLabel = SIZES.find((s) => s.value === wheelSize)?.label;

    const renderTableRow = ({ item }: { item: SapProduct }) => {
        const cartItem = cartItems.find((i) => i.id === item.id);

        return (
            <View style={styles.tableRow}>
                {/* Left: Slightly larger image spanning the 2 lines */}
                <View style={styles.imagePlaceholder}>
                    <Feather name="disc" size={28} color={colors.textSecondary} />
                </View>

                {/* Right: Content constrained to exactly 2 lines */}
                <View style={styles.rowContent}>
                    {/* Line 1: Name & Price */}
                    <View style={styles.rowLineOne}>
                        <Text style={styles.productName} numberOfLines={1}>
                            {item.itemName}
                        </Text>
                        <Text style={styles.priceText}>
                            ₹{item.price.toLocaleString("en-IN")}
                        </Text>
                    </View>

                    {/* Line 2: Code, Badges & Action */}
                    <View style={styles.rowLineTwo}>
                        <View style={styles.badgesContainer}>
                            <Text style={styles.productCode}>{item.itemCode}</Text>
                            <View style={styles.sizeBadge}>
                                <Text style={styles.sizeBadgeText}>{item.wheelSize}</Text>
                            </View>
                            <View style={styles.stockBadge}>
                                <View style={styles.stockDot} />
                                <Text style={styles.stockBadgeText}>
                                    {item.inStockQty} in stock
                                </Text>
                            </View>
                        </View>

                        {cartItem ? (
                            <View style={styles.inlineStepper}>
                                <TouchableOpacity
                                    onPress={() => updateQuantity(item.id, cartItem.quantity - 1)}
                                    style={styles.inlineStepperBtn}
                                >
                                    <Feather name="minus" size={14} color={colors.white} />
                                </TouchableOpacity>
                                <Text style={styles.inlineStepperText}>{cartItem.quantity}</Text>
                                <TouchableOpacity
                                    onPress={() => updateQuantity(item.id, cartItem.quantity + 1)}
                                    style={styles.inlineStepperBtn}
                                >
                                    <Feather name="plus" size={14} color={colors.white} />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity
                                style={styles.actionButton}
                                activeOpacity={0.8}
                                onPress={() => addToCart(item)}
                            >
                                <Text style={styles.actionButtonText}>Add</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
        );
    };

    const renderGridCard = ({ item }: { item: SapProduct }) => {
        const cartItem = cartItems.find((i) => i.id === item.id);

        return (
            <View style={styles.gridCard}>
                <View style={styles.cardHeader}>
                    <View style={styles.sizeBadge}>
                        <Text style={styles.sizeBadgeText}>{item.wheelSize}</Text>
                    </View>
                </View>

                <View style={styles.gridImageContainer}>
                    <Feather name="disc" size={48} color={colors.textSecondary} />
                </View>

                <Text style={styles.gridProductName} numberOfLines={2}>
                    {item.itemName}
                </Text>
                <Text style={styles.gridProductCode}>{item.itemCode}</Text>

                <View style={[styles.stockBadge, styles.gridStockBadge]}>
                    <View style={styles.stockDot} />
                    <Text style={styles.stockBadgeText}>{item.inStockQty} in stock</Text>
                </View>

                <Text style={styles.gridPriceText}>₹{item.price.toLocaleString("en-IN")}</Text>

                {cartItem ? (
                    <View style={styles.gridInlineStepper}>
                        <TouchableOpacity
                            onPress={() => updateQuantity(item.id, cartItem.quantity - 1)}
                            style={styles.gridInlineStepperBtn}
                        >
                            <Feather name="minus" size={16} color={colors.white} />
                        </TouchableOpacity>
                        <Text style={styles.inlineStepperText}>{cartItem.quantity}</Text>
                        <TouchableOpacity
                            onPress={() => updateQuantity(item.id, cartItem.quantity + 1)}
                            style={styles.gridInlineStepperBtn}
                        >
                            <Feather name="plus" size={16} color={colors.white} />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={styles.gridActionButton}
                        activeOpacity={0.8}
                        onPress={() => addToCart(item)}
                    >
                        <Text style={styles.actionButtonText}>Add to Order</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
            {/* Top Filter Bar */}
            <View style={styles.filterSection}>
                <View style={styles.searchContainer}>
                    <Text style={styles.filterLabel}>Search</Text>
                    <View style={styles.searchInputWrapper}>
                        <Feather name="search" size={16} color={colors.muted} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search by product name or item code..."
                            placeholderTextColor={colors.muted}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery("")} hitSlop={8}>
                                <Feather name="x" size={16} color={colors.muted} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
                <View style={styles.dropdownRow}>
                    <View style={styles.dropdownContainer}>
                        <Text style={styles.filterLabel}>Stock</Text>
                        <TouchableOpacity
                            style={styles.dropdownTrigger}
                            onPress={() => setStockModalVisible(true)}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.dropdownValueText} numberOfLines={1}>
                                {selectedStockLabel}
                            </Text>
                            <Feather name="chevron-down" size={16} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.dropdownContainer}>
                        <Text style={styles.filterLabel}>Size</Text>
                        <TouchableOpacity
                            style={styles.dropdownTrigger}
                            onPress={() => setSizeModalVisible(true)}
                            activeOpacity={0.7}
                        >
                            <Feather name="tag" size={14} color={colors.primary} />
                            <Text style={styles.dropdownValueText} numberOfLines={1}>
                                {selectedSizeLabel}
                            </Text>
                            <Feather name="chevron-down" size={16} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.controlRow}>
                    <View style={styles.viewToggleGroup}>
                        <TouchableOpacity
                            style={[styles.toggleBtn, viewMode === "grid" && styles.toggleBtnActive]}
                            onPress={() => setViewMode("grid")}
                        >
                            <Feather
                                name="grid"
                                size={18}
                                color={viewMode === "grid" ? colors.white : colors.textSecondary}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.toggleBtn, viewMode === "table" && styles.toggleBtnActive]}
                            onPress={() => setViewMode("table")}
                        >
                            <Feather
                                name="list"
                                size={18}
                                color={viewMode === "table" ? colors.white : colors.textSecondary}
                            />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.rightActions}>
                        <TouchableOpacity
                            style={styles.resetButton}
                            onPress={handleReset}
                            activeOpacity={0.7}
                        >
                            <Feather name="rotate-ccw" size={14} color={colors.text} />
                            <Text style={styles.resetButtonText}>Reset</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.cartButton}
                            activeOpacity={0.8}
                            onPress={() => router.push("/cart")}
                        >
                            <Feather name="shopping-cart" size={16} color={colors.white} />
                            <Text style={styles.cartButtonText}>
                                Cart {cartItems.length > 0 ? `(${cartItems.length})` : ""}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Main Content */}
            {isLoading ? (
                <View style={styles.centerBox}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : filteredProducts.length === 0 ? (
                <View style={styles.centerBox}>
                    <Feather name="inbox" size={48} color={colors.muted} />
                    <Text style={styles.emptyTitle}>No products found</Text>
                    <Text style={styles.emptySubtitle}>Try changing your search or filters.</Text>
                </View>
            ) : (
                <LegendList
                    key={viewMode}
                    data={filteredProducts}
                    keyExtractor={(item: any) => item.id.toString()}
                    estimatedItemSize={viewMode === "grid" ? 250 : 80}
                    numColumns={viewMode === "grid" ? 2 : 1}
                    renderItem={viewMode === "grid" ? renderGridCard : renderTableRow}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    onRefresh={refetch}
                    recycleItems={true}
                    refreshing={isRefetching}
                    extraData={cartItems}
                />
            )}

            {/* Stock Selection Modal */}
            <Modal visible={stockModalVisible} transparent animationType="fade">
                <Pressable style={styles.modalOverlay} onPress={() => setStockModalVisible(false)}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>Select Stock Type</Text>
                        {STOCK_OPTIONS.map((item) => (
                            <TouchableOpacity
                                key={item.value}
                                style={[
                                    styles.modalOption,
                                    stockType === item.value && styles.modalOptionSelected,
                                ]}
                                onPress={() => {
                                    setStockType(item.value);
                                    setStockModalVisible(false);
                                }}
                            >
                                <Text
                                    style={[
                                        styles.modalOptionText,
                                        stockType === item.value && styles.modalOptionTextSelected,
                                    ]}
                                >
                                    {item.label}
                                </Text>
                                {stockType === item.value && (
                                    <Feather name="check" size={16} color={colors.primary} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </Pressable>
            </Modal>

            <Modal visible={brandModalVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>Select Brand</Text>
                        {user?.dealer_brand_type?.map((brandOption) => (
                            <TouchableOpacity
                                key={brandOption}
                                style={[
                                    styles.modalOption,
                                    selectedBrand === brandOption && styles.modalOptionSelected,
                                ]}
                                onPress={() => {
                                    setSelectedBrand(brandOption);
                                    setBrandModalVisible(false);
                                }}
                            >
                                <Text
                                    style={[
                                        styles.modalOptionText,
                                        selectedBrand === brandOption && styles.modalOptionTextSelected,
                                    ]}
                                >
                                    {brandOption}
                                </Text>
                                {selectedBrand === brandOption && (
                                    <Feather name="check" size={16} color={colors.primary} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </Modal>

            {/* Size Selection Modal */}
            <Modal visible={sizeModalVisible} transparent animationType="fade">
                <Pressable style={styles.modalOverlay} onPress={() => setSizeModalVisible(false)}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>Select Wheel Size</Text>
                        {SIZES.map((item) => (
                            <TouchableOpacity
                                key={item.value}
                                style={[
                                    styles.modalOption,
                                    wheelSize === item.value && styles.modalOptionSelected,
                                ]}
                                onPress={() => {
                                    setWheelSize(item.value);
                                    setSizeModalVisible(false);
                                }}
                            >
                                <Text
                                    style={[
                                        styles.modalOptionText,
                                        wheelSize === item.value && styles.modalOptionTextSelected,
                                    ]}
                                >
                                    {item.label}
                                </Text>
                                {wheelSize === item.value && (
                                    <Feather name="check" size={16} color={colors.primary} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
    },
    filterSection: {
        padding: spacing.md,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        gap: spacing.sm,
    },
    dropdownRow: {
        flexDirection: "row",
        gap: spacing.sm,
    },
    dropdownContainer: {
        flex: 1,
    },
    filterLabel: {
        fontSize: txtSize.xs,
        fontFamily: typography.medium,
        color: colors.textSecondary,
        marginBottom: 4,
    },
    dropdownTrigger: {
        height: 40,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        backgroundColor: colors.surface,
        gap: 6,
    },
    dropdownValueText: {
        flex: 1,
        fontSize: txtSize.small,
        fontFamily: typography.medium,
        color: colors.text,
    },
    searchContainer: {
        width: "100%",
    },
    searchInputWrapper: {
        height: 40,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        backgroundColor: colors.surface,
        gap: spacing.xs,
    },
    searchInput: {
        flex: 1,
        fontSize: txtSize.small,
        fontFamily: typography.regular,
        color: colors.text,
        padding: 0,
    },
    controlRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 4,
    },
    viewToggleGroup: {
        flexDirection: "row",
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        overflow: "hidden",
    },
    toggleBtn: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        backgroundColor: colors.surface,
    },
    toggleBtnActive: {
        backgroundColor: colors.primary,
    },
    rightActions: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
    },
    resetButton: {
        flexDirection: "row",
        alignItems: "center",
        height: 34,
        paddingHorizontal: spacing.md,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.white,
        gap: 6,
    },
    resetButtonText: {
        fontSize: txtSize.xs,
        fontFamily: typography.medium,
        color: colors.text,
    },
    cartButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        height: 34,
        paddingHorizontal: spacing.md,
        borderRadius: radius.md,
        backgroundColor: colors.primary,
        gap: 6,
        minWidth: 90
    },
    cartButtonText: {
        fontSize: txtSize.xs,
        fontFamily: typography.bold,
        color: colors.white,
    },
    listContainer: {
        padding: spacing.md,
        gap: spacing.sm,
    },
    tableRow: {
        flexDirection: "row",
        alignItems: "center",
        padding: spacing.md,
        backgroundColor: colors.white,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border,
        gap: spacing.md, // Increased gap from image
    },
    imagePlaceholder: {
        width: 48,
        height: 48,
        borderRadius: radius.sm,
        backgroundColor: colors.surface,
        alignItems: "center",
        justifyContent: "center",
    },
    rowContent: {
        flex: 1,
        gap: 8, // Space between Line 1 and Line 2
    },
    rowLineOne: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: spacing.sm,
    },
    rowLineTwo: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    productInfo: {
        flex: 1,
        marginHorizontal: 4,
    },
    badgesContainer: {
        flexDirection: "row",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 6,
        flex: 1,
        paddingRight: 8,
    },
    productName: {
        flex: 1,
        fontSize: txtSize.small,
        fontFamily: typography.bold,
        color: colors.text,
    },
    productCode: {
        fontSize: 11,
        fontFamily: typography.medium,
        color: colors.muted,
    },
    priceText: {
        fontSize: txtSize.small,
        fontFamily: typography.bold,
        color: colors.text,
    },
    sizeBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        backgroundColor: colors.surface,
        borderRadius: radius.sm,
        borderWidth: 1,
        borderColor: colors.border,
    },
    sizeBadgeText: {
        fontSize: 10,
        fontFamily: typography.medium,
        color: colors.textSecondary,
    },
    stockBadge: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 6,
        paddingVertical: 2,
        backgroundColor: "#DCFCE7",
        borderRadius: radius.xl,
        gap: 4,
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
    actionButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: colors.primary,
        borderRadius: radius.sm,
        minWidth: 70,
        alignItems: "center",
    },
    inlineStepper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.primary,
        borderRadius: radius.sm,
        height: 32,
        minWidth: 70,
    },
    inlineStepperBtn: {
        paddingHorizontal: 8,
        height: "100%",
        justifyContent: "center",
    },
    inlineStepperText: {
        fontSize: txtSize.xs,
        fontFamily: typography.bold,
        color: colors.white,
        paddingHorizontal: 6,
    },
    gridActionButton: {
        paddingVertical: 12.5,
        backgroundColor: colors.primary,
        borderRadius: radius.md,
        alignItems: "center",
    },
    gridInlineStepper: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: colors.primary,
        borderRadius: radius.md,
        height: 40,
    },
    gridInlineStepperBtn: {
        paddingHorizontal: 16,
        height: "100%",
        justifyContent: "center",
    },
    actionButtonText: {
        fontSize: txtSize.xs,
        fontFamily: typography.bold,
        color: colors.white,
    },
    gridCard: {
        flex: 1,
        margin: spacing.xs,
        padding: spacing.sm,
        backgroundColor: colors.white,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "flex-end",
    },
    gridImageContainer: {
        height: 90,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        marginVertical: spacing.xs,
    },
    gridProductName: {
        fontSize: txtSize.xs,
        fontFamily: typography.bold,
        color: colors.text,
        minHeight: 32,
    },
    gridProductCode: {
        fontSize: 10,
        fontFamily: typography.regular,
        color: colors.muted,
        marginBottom: 4,
    },
    gridStockBadge: {
        alignSelf: "flex-start",
        marginBottom: 4,
    },
    gridPriceText: {
        fontSize: txtSize.small,
        fontFamily: typography.bold,
        color: colors.text,
        marginBottom: 6,
    },
    centerBox: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: spacing.xl,
    },
    emptyTitle: {
        fontSize: txtSize.body,
        fontFamily: typography.bold,
        color: colors.text,
        marginTop: spacing.md,
    },
    emptySubtitle: {
        fontSize: txtSize.small,
        fontFamily: typography.regular,
        color: colors.muted,
        marginTop: 4,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        alignItems: "center",
        padding: spacing.xl,
    },
    modalCard: {
        width: "100%",
        backgroundColor: colors.white,
        borderRadius: radius.lg,
        padding: spacing.md,
        gap: 4,
    },
    modalTitle: {
        fontSize: txtSize.body,
        fontFamily: typography.bold,
        color: colors.text,
        marginBottom: spacing.xs,
    },
    modalOption: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: radius.sm,
    },
    modalOptionSelected: {
        backgroundColor: colors.surface,
    },
    modalOptionText: {
        fontSize: txtSize.small,
        fontFamily: typography.regular,
        color: colors.text,
    },
    modalOptionTextSelected: {
        fontFamily: typography.bold,
        color: colors.primary,
    },
});

export default DealerProductsScreen;