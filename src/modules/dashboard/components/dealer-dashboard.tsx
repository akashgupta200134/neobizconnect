import { colors, radius, spacing, txtSize, typography } from "@/constants/theme";
import { useAuthStore } from "@/store/auth.store";
import { Feather } from "@react-native-vector-icons/feather/static";
import { Text as SkiaText, useFont } from "@shopify/react-native-skia";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Modal, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { BarGroup, CartesianChart } from "victory-native";
import { fetchDashboardData } from "../services/dashboard.api";

const BAR_COLORS = ["#60A5FA", "#34D399", "#FB923C", "#A78BFA", "#38BDF8", "#F472B6", "#2DD4BF"];
const MONTHS = ["April", "May", "June", "July", "August", "September", "October", "November", "December", "January", "February", "March"];
const YEARS = ["2024-2025", "2025-2026", "2026-2027"];

const formatNumber = (num: number) => {
    return num?.toLocaleString("en-IN") || "0";
};

const AnimatedBarCell = ({ targetPercent, barColor, text, index, flexValue, marginLeft = 0 }: any) => {
    const widthAnim = useSharedValue(0);

    React.useEffect(() => {
        const timer = setTimeout(() => {
            widthAnim.value = withDelay(index * 100, withTiming(targetPercent, { duration: 600 }));
        }, 50);

        return () => clearTimeout(timer);
    }, [targetPercent, index]);

    const rStyle = useAnimatedStyle(() => ({
        width: `${widthAnim.value}%`,
    }));

    return (
        <View style={[styles.barCellContainer, { flex: flexValue, marginLeft }]}>
            <Animated.View style={[styles.tableBackgroundBar, { backgroundColor: barColor }, rStyle]} />
            <Text style={styles.barValueText}>{text}</Text>
        </View>
    );
};

const EmptyChartState = ({ icon = "bar-chart-2" }: { icon?: string }) => (
    <View style={styles.emptyStateContainer}>
        <Feather name={icon as any} size={32} color={colors.surface} />
        <Text style={styles.emptyStateText}>No data available</Text>
    </View>
);

// ---- Skeleton loading state ----

const SkeletonBlock = ({ style }: { style?: any }) => {
    const pulse = useSharedValue(0.40);

    React.useEffect(() => {
        pulse.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 750 }),
                withTiming(0.40, { duration: 750 })
            ),
            -1,
            true
        );
    }, []);

    const rStyle = useAnimatedStyle(() => ({ opacity: pulse.value }));

    return <Animated.View style={[styles.skeletonBlock, style, rStyle]} />;
};

const SkeletonKPICard = () => (
    <View style={styles.kpiCard}>
        <SkeletonBlock style={{ width: "65%", height: 11, borderRadius: 4, marginBottom: 10 }} />
        <SkeletonBlock style={{ width: "45%", height: 18, borderRadius: 4 }} />
    </View>
);

const SKELETON_BAR_HEIGHTS = [70, 130, 55, 95, 35, 120, 65];

const SkeletonBarChartCard = () => (
    <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
            <SkeletonBlock style={{ width: 150, height: 14, borderRadius: 4 }} />
            <SkeletonBlock style={{ width: 90, height: 12, borderRadius: 4 }} />
        </View>
        <View style={styles.skeletonChartArea}>
            {SKELETON_BAR_HEIGHTS.map((h, i) => (
                <View key={i} style={styles.skeletonBarPair}>
                    <SkeletonBlock style={{ width: 12, height: h, borderRadius: 3 }} />
                    <SkeletonBlock style={{ width: 12, height: h * 0.75, borderRadius: 3 }} />
                </View>
            ))}
        </View>
    </View>
);

const SkeletonBarListRow = () => (
    <View style={styles.tableRow}>
        <SkeletonBlock style={{ flex: 2, height: 12, borderRadius: 4, marginRight: 8 }} />
        <SkeletonBlock style={{ flex: 1.5, height: 20, borderRadius: 4 }} />
    </View>
);

const SkeletonBarListCard = ({ rows = 4 }: { rows?: number }) => (
    <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
            <SkeletonBlock style={{ width: 140, height: 14, borderRadius: 4 }} />
        </View>
        <View style={[styles.tableHeaderRow, { gap: 8 }]}>
            <SkeletonBlock style={{ flex: 2, height: 9, borderRadius: 3 }} />
            <SkeletonBlock style={{ flex: 1, height: 9, borderRadius: 3 }} />
        </View>
        {Array.from({ length: rows }).map((_, i) => (
            <SkeletonBarListRow key={i} />
        ))}
    </View>
);

const DashboardBodySkeleton = () => (
    <>
        <View style={styles.kpiGrid}>
            {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonKPICard key={i} />
            ))}
        </View>

        <SkeletonBarChartCard />
        <SkeletonBarListCard rows={4} />
        <SkeletonBarListCard rows={4} />
        <SkeletonBarListCard rows={3} />
    </>
);

// Helper to calculate dynamic initial filters
const getInitialFilters = () => {
    const today = new Date();
    const currentMonth = format(today, "MMMM");
    const year = today.getFullYear();
    const isJanToMar = today.getMonth() < 3; // 0 = Jan, 1 = Feb, 2 = Mar
    const currentFY = isJanToMar ? `${year - 1}-${year}` : `${year}-${year + 1}`;

    return {
        financial_year: currentFY,
        month: "" // Default to no month filter,
    };
};

export const DashboardScreen = () => {
    const [animatedChartData, setAnimatedChartData] = useState<any[]>([]);
    const user = useAuthStore((state) => state.user);
    const groupCompanyName = user?.group_company_name || "Neo";
    const router = useRouter();

    const font = useFont(require("../../../../assets/fonts/Geist/static/Geist-Regular.ttf"), 10);

    const [filters, setFilters] = useState(getInitialFilters());
    const [isFilterVisible, setFilterVisible] = useState(false);
    const [tempFilters, setTempFilters] = useState(filters);

    const { data, isLoading, isRefetching, refetch } = useQuery({
        queryKey: ["dashboard", groupCompanyName, filters],
        queryFn: () => fetchDashboardData(groupCompanyName, filters),
        enabled: Boolean(groupCompanyName)
    });

    React.useEffect(() => {
        if (data?.target_vs_achievement && data.target_vs_achievement.length > 0) {
            setAnimatedChartData(
                data.target_vs_achievement.map((d: any) => ({ ...d, achieved_quantity: 0, target_quantity: 0 }))
            );

            const timer = setTimeout(() => {
                setAnimatedChartData(data.target_vs_achievement);
            }, 100);

            return () => clearTimeout(timer);
        } else {
            setAnimatedChartData([]);
        }
    }, [data]);

    const applyFilters = () => {
        setFilters(tempFilters);
        setFilterVisible(false);
    };

    const resetFilters = () => {
        const emptyFilters = { financial_year: "", month: "" };
        setTempFilters(emptyFilters);
        setFilters(emptyFilters);
        setFilterVisible(false);
    };

    const getSubtitle = () => {
        if (!filters.month && !filters.financial_year) return "All Time";
        if (filters.month && filters.financial_year) return `${filters.month} | ${filters.financial_year}`;
        return filters.month || filters.financial_year;
    };

    const showSkeleton = isLoading || !data || !font;

    const KPICard = ({ title, value, isCurrency = false }: { title: string; value: number; isCurrency?: boolean }) => (
        <View style={styles.kpiCard}>
            <Text style={styles.kpiTitle}>{title}</Text>
            <Text style={styles.kpiValue}>
                {isCurrency ? "₹" : ""}{formatNumber(value)}
            </Text>
        </View>
    );

    const BarListTable = ({ title, data, labelKey, valueKey, percentKey, icon = "pie-chart" }: any) => {
        return (
            <View style={styles.chartCard}>
                <View style={styles.chartHeader}>
                    <Text style={styles.chartTitle}>{title}</Text>
                </View>

                {!data || data.length === 0 ? (
                    <EmptyChartState icon={icon} />
                ) : (
                    <>
                        <View style={styles.tableHeaderRow}>
                            <Text style={[styles.tableHeaderText, { flex: 2 }]}>{labelKey.replace(/_/g, ' ').toUpperCase()}</Text>
                            <Text style={[styles.tableHeaderText, { flex: 1, textAlign: "right" }]}>SUM(QTY)</Text>
                            {percentKey && <Text style={[styles.tableHeaderText, { flex: 1, textAlign: "right" }]}>% MIX</Text>}
                        </View>

                        {data.map((item: any, index: number) => {
                            const maxValue = Math.max(...data.map((d: any) => d[valueKey]));
                            const widthPercent = maxValue === 0 ? 0 : (item[valueKey] / maxValue) * 100;
                            const barColor = BAR_COLORS[index % BAR_COLORS.length];

                            return (
                                <View key={index} style={styles.tableRow}>
                                    <Text style={[styles.tableCellText, { flex: 2 }]} numberOfLines={1}>
                                        {item[labelKey]}
                                    </Text>

                                    <AnimatedBarCell
                                        targetPercent={widthPercent}
                                        barColor={barColor}
                                        text={formatNumber(item[valueKey])}
                                        index={index}
                                        flexValue={percentKey ? 1 : 1.5}
                                    />

                                    {percentKey && (
                                        <AnimatedBarCell
                                            targetPercent={item[percentKey]}
                                            barColor={barColor}
                                            text={`${item[percentKey]}%`}
                                            index={index}
                                            flexValue={1}
                                            marginLeft={8}
                                        />
                                    )}
                                </View>
                            );
                        })}
                    </>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
            <ScrollView 
                contentContainerStyle={styles.scrollContent} 
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl 
                        refreshing={isRefetching} 
                        onRefresh={refetch} 
                        colors={[colors.primary]} 
                        tintColor={colors.primary}
                    />
                }
            >
                <View style={styles.header}>
                    <View>
                        <Text style={styles.headerTitle}>Dashboard</Text>
                        <Text style={styles.headerSubtitle}>{getSubtitle()}</Text>
                    </View>
                    <View style={styles.headerActions}>
                        <TouchableOpacity onPress={() => { setTempFilters(filters); setFilterVisible(true); }} style={styles.headerBtn}>
                            <Feather name="filter" size={16} color={colors.textSecondary} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => router.push("/profile")} style={styles.headerBtn}>
                            <Feather name="user" size={16} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>
                </View>

                {showSkeleton ? (
                    <DashboardBodySkeleton />
                ) : (
                <>
                <View style={styles.kpiGrid}>
                    <KPICard title="Total Pending Qty" value={data.total_pending_quantity} />
                    <KPICard title="Total PI/OIP Qty" value={data.total_pi_oip_quantity} />
                    <KPICard title="Total Invoice Qty" value={data.total_invoice_quantity} />
                    <KPICard title="Total Outstanding (₹)" value={data.total_outstanding} isCurrency />
                    <KPICard title="Total Sales (₹)" value={data.total_sales} isCurrency />
                    <KPICard title="Target Sales (Nos.)" value={data.target_sales} />
                    <KPICard title="Achieved Sales (Nos.)" value={data.achieved_sales} />
                    <KPICard title="Credit Limit (₹)" value={data.credit_limit} isCurrency />
                </View>

                <View style={styles.chartCard}>
                    <View style={styles.chartHeader}>
                        <Text style={styles.chartTitle}>Target vs Achievement</Text>
                        <View style={styles.chartLegendRow}>
                            <View style={[styles.legendDot, { backgroundColor: "#F97316" }]} />
                            <Text style={styles.legendText}>SUM(qty)</Text>
                            <View style={[styles.legendDot, { backgroundColor: "#3B82F6", marginLeft: 12 }]} />
                            <Text style={styles.legendText}>SUM(target)</Text>
                        </View>
                    </View>

                    {animatedChartData.length === 0 ? (
                        <EmptyChartState icon="bar-chart-2" />
                    ) : (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <View style={{ height: 300, width: Math.max(350, animatedChartData.length * 55) }}>
                                <CartesianChart
                                    data={animatedChartData}
                                    xKey="month"
                                    yKeys={["achieved_quantity", "target_quantity"]}
                                    domainPadding={{ left: 30, right: 30, top: 40 }}
                                    axisOptions={{
                                        font,
                                        tickCount: 12, // Force render all 12 ticks/months
                                        lineColor: colors.border,
                                        labelColor: colors.textSecondary,
                                        formatYLabel: (val) => `${val}`,
                                    }}
                                >
                                    {({ points, chartBounds }) => {
                                        const barOffset = 10;

                                        return (
                                            <>
                                                <BarGroup
                                                    chartBounds={chartBounds}
                                                    betweenGroupPadding={0.3}
                                                    withinGroupPadding={0.1}
                                                >
                                                    <BarGroup.Bar
                                                        points={points.achieved_quantity}
                                                        color="#F97316"
                                                        animate={{ type: "timing", duration: 600 }}
                                                    />
                                                    <BarGroup.Bar
                                                        points={points.target_quantity}
                                                        color="#3B82F6"
                                                        animate={{ type: "timing", duration: 600 }}
                                                    />
                                                </BarGroup>

                                                {points.achieved_quantity.map((p, i) => {
                                                    if (typeof p.y !== "number" || typeof p.yValue !== "number") return null;

                                                    const valStr = p.yValue.toString();
                                                    const textWidth = font.measureText(valStr).width;
                                                    return (
                                                        <SkiaText
                                                            key={`qty-${i}`}
                                                            x={p.x - barOffset - (textWidth / 2)}
                                                            y={p.y - 8}
                                                            text={valStr}
                                                            font={font}
                                                            color={colors.textSecondary}
                                                        />
                                                    );
                                                })}

                                                {points.target_quantity.map((p, i) => {
                                                    if (typeof p.y !== "number" || typeof p.yValue !== "number") return null;

                                                    const valStr = p.yValue.toString();
                                                    const textWidth = font.measureText(valStr).width;
                                                    return (
                                                        <SkiaText
                                                            key={`tgt-${i}`}
                                                            x={p.x + barOffset - (textWidth / 2)}
                                                            y={p.y - 8}
                                                            text={valStr}
                                                            font={font}
                                                            color={colors.textSecondary}
                                                        />
                                                    );
                                                })}
                                            </>
                                        );
                                    }}
                                </CartesianChart>
                            </View>
                        </ScrollView>
                    )}
                </View>

                <BarListTable
                    title="Top Selling Design"
                    data={data.top_selling_design}
                    labelKey="design"
                    valueKey="total_quantity"
                    icon="layers"
                />

                <BarListTable
                    title="Top Selling SKU's"
                    data={data.top_selling_sku}
                    labelKey="item_description"
                    valueKey="total_quantity"
                    icon="box"
                />

                <BarListTable
                    title="Sales Mix by Wheel Size"
                    data={data.sales_mix_by_wheel_size}
                    labelKey="wheel_size"
                    valueKey="total_quantity"
                    percentKey="sales_mix_percentage"
                    icon="pie-chart"
                />
                </>
                )}

            </ScrollView>

            <Modal visible={isFilterVisible} animationType="slide" transparent={true} backdropColor={"transparent"}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Filter Dashboard</Text>
                            <TouchableOpacity onPress={() => setFilterVisible(false)}>
                                <Feather name="x" size={24} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.filterSectionTitle}>Financial Year</Text>
                        <View style={styles.chipContainer}>
                            {YEARS.map(year => (
                                <TouchableOpacity
                                    key={year}
                                    style={[styles.chip, tempFilters.financial_year === year && styles.chipActive]}
                                    onPress={() => setTempFilters(prev => ({ 
                                        ...prev, 
                                        financial_year: prev.financial_year === year ? "" : year 
                                    }))}
                                >
                                    <Text style={[styles.chipText, tempFilters.financial_year === year && styles.chipTextActive]}>
                                        {year}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.filterSectionTitle}>Month</Text>
                        <View style={styles.chipContainer}>
                            {MONTHS.map(month => (
                                <TouchableOpacity
                                    key={month}
                                    style={[styles.chip, tempFilters.month === month && styles.chipActive]}
                                    onPress={() => setTempFilters(prev => ({ 
                                        ...prev, 
                                        month: prev.month === month ? "" : month 
                                    }))}
                                >
                                    <Text style={[styles.chipText, tempFilters.month === month && styles.chipTextActive]}>
                                        {month}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={styles.modalActionRow}>
                            <TouchableOpacity style={styles.resetBtn} onPress={resetFilters}>
                                <Text style={styles.resetBtnText}>Reset</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.applyBtn} onPress={applyFilters}>
                                <Text style={styles.applyBtnText}>Apply</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    scrollContent: { padding: spacing.md, paddingBottom: spacing.xxl },

    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.md },
    headerTitle: { fontSize: 24, fontFamily: typography.bold, color: colors.text },
    headerSubtitle: { fontSize: txtSize.small, fontFamily: typography.medium, color: colors.textSecondary, marginTop: 2 },
    headerActions: { flexDirection: "row", gap: spacing.sm },
    headerBtn: { padding: 10, backgroundColor: colors.white, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border },

    kpiGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
    kpiCard: { width: "48%", backgroundColor: colors.white, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md },
    kpiTitle: { fontSize: 11, fontFamily: typography.medium, color: colors.textSecondary, marginBottom: 8 },
    kpiValue: { fontSize: 18, fontFamily: typography.bold, color: colors.text },

    chartCard: { backgroundColor: colors.white, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.lg, minHeight: 200 },
    chartHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.lg },
    chartTitle: { fontSize: 14, fontFamily: typography.bold, color: colors.text },
    chartLegendRow: { flexDirection: "row", alignItems: "center" },
    legendDot: { width: 10, height: 10, borderRadius: 2, marginRight: 6 },
    legendText: { fontSize: 10, fontFamily: typography.medium, color: colors.textSecondary },

    emptyStateContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: spacing.xxl },
    emptyStateText: { marginTop: 12, fontSize: 13, fontFamily: typography.medium, color: colors.muted },

    tableHeaderRow: { flexDirection: "row", paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: colors.border, marginBottom: 8 },
    tableHeaderText: { fontSize: 10, fontFamily: typography.bold, color: colors.muted },
    tableRow: { flexDirection: "row", alignItems: "center", paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.surface },
    tableCellText: { fontSize: 11, fontFamily: typography.medium, color: colors.text, paddingRight: 8 },

    barCellContainer: { height: 24, justifyContent: "center", position: "relative" },
    tableBackgroundBar: { position: "absolute", left: 0, top: 0, bottom: 0, borderRadius: 2, opacity: 0.8 },
    barValueText: { fontSize: 11, fontFamily: typography.bold, color: colors.black, textAlign: "center", zIndex: 1, textShadowColor: 'rgba(0, 0, 0, 0.3)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: colors.white, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing.lg, maxHeight: '80%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
    modalTitle: { fontSize: 18, fontFamily: typography.bold, color: colors.text },
    filterSectionTitle: { fontSize: 14, fontFamily: typography.bold, color: colors.text, marginBottom: spacing.sm, marginTop: spacing.sm },
    chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.md },
    chip: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
    chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    chipText: { fontSize: 13, fontFamily: typography.medium, color: colors.textSecondary },
    chipTextActive: { color: colors.white },
    
    modalActionRow: { flexDirection: "row", gap: spacing.md, marginTop: spacing.lg },
    resetBtn: { flex: 1, paddingVertical: 14, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, alignItems: "center" },
    resetBtnText: { color: colors.text, fontSize: 16, fontFamily: typography.medium },
    applyBtn: { flex: 1, backgroundColor: colors.primary, paddingVertical: 14, borderRadius: radius.md, alignItems: "center" },
    applyBtnText: { color: colors.white, fontSize: 16, fontFamily: typography.bold },

    skeletonBlock: { backgroundColor: colors.border },
    skeletonChartArea: { height: 300, flexDirection: "row", alignItems: "flex-end", justifyContent: "space-around", paddingHorizontal: spacing.sm, paddingBottom: spacing.lg },
    skeletonBarPair: { flexDirection: "row", alignItems: "flex-end", gap: 4 },
});