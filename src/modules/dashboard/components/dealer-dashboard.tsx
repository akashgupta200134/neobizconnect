import { colors, radius, spacing, txtSize, typography } from "@/constants/theme";
import { useAuthStore } from "@/store/auth.store";
import { Feather } from "@react-native-vector-icons/feather/static";
import { Text as SkiaText, useFont } from "@shopify/react-native-skia";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { BarGroup, CartesianChart } from "victory-native";
import { fetchDashboardData } from "../services/dashboard.api";

const BAR_COLORS = ["#60A5FA", "#34D399", "#FB923C", "#A78BFA", "#38BDF8", "#F472B6", "#2DD4BF"];
const MONTHS = ["April", "May", "June", "July", "August", "September", "October", "November", "December", "January", "February", "March"];
const YEARS = ["2024-25", "2025-26", "2026-27"];

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

export const DashboardScreen = () => {
    const [animatedChartData, setAnimatedChartData] = useState<any[]>([]);
    const user = useAuthStore((state) => state.user);
    const groupCompanyName = user?.group_company_name || "Neo";
    const router = useRouter();

    const font = useFont(require("../../../../assets/fonts/Geist/static/Geist-Regular.ttf"), 10);

    const [filters, setFilters] = useState({
        financial_year: "2026-27",
        month: "August",
    });

    const [isFilterVisible, setFilterVisible] = useState(false);
    const [tempFilters, setTempFilters] = useState(filters);

    const { data, isLoading } = useQuery({
        queryKey: ["dashboard", groupCompanyName, filters],
        queryFn: () => fetchDashboardData(groupCompanyName, filters),
        enabled: Boolean(groupCompanyName),
        refetchInterval: 10000
    });

    React.useEffect(() => {
        if (data?.target_vs_achievement) {
            // 1. Initialize the chart with the correct months but 0 quantities
            setAnimatedChartData(
                data.target_vs_achievement.map(d => ({ ...d, quantity: 0, target_quantity: 0 }))
            );

            // 2. Trigger the state change 100ms later to force the animation to run
            const timer = setTimeout(() => {
                setAnimatedChartData(data.target_vs_achievement);
            }, 100);

            return () => clearTimeout(timer);
        }
    }, [data]);

    const applyFilters = () => {
        setFilters(tempFilters);
        setFilterVisible(false);
    };

    if (isLoading || !data || !font) {
        return (
            <SafeAreaView style={[styles.safeArea, styles.centerBox]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </SafeAreaView>
        );
    }

    const KPICard = ({ title, value, isCurrency = false }: { title: string; value: number; isCurrency?: boolean }) => (
        <View style={styles.kpiCard}>
            <Text style={styles.kpiTitle}>{title}</Text>
            <Text style={styles.kpiValue}>
                {isCurrency ? "₹" : ""}{formatNumber(value)}
            </Text>
        </View>
    );

    const BarListTable = ({ title, data, labelKey, valueKey, percentKey }: any) => {
        if (!data || data.length === 0) return null;
        const maxValue = Math.max(...data.map((d: any) => d[valueKey]));

        return (
            <View style={styles.chartCard}>
                <View style={styles.chartHeader}>
                    <Text style={styles.chartTitle}>{title}</Text>
                </View>

                <View style={styles.tableHeaderRow}>
                    <Text style={[styles.tableHeaderText, { flex: 2 }]}>{labelKey.replace(/_/g, ' ').toUpperCase()}</Text>
                    <Text style={[styles.tableHeaderText, { flex: 1, textAlign: "right" }]}>SUM(QTY)</Text>
                    {percentKey && <Text style={[styles.tableHeaderText, { flex: 1, textAlign: "right" }]}>% MIX</Text>}
                </View>

                {data.map((item: any, index: number) => {
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
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                <View style={styles.header}>
                    <View>
                        <Text style={styles.headerTitle}>Dashboard</Text>
                        <Text style={styles.headerSubtitle}>{filters.month} | {filters.financial_year}</Text>
                    </View>
                    <View style={styles.headerActions}>
                        <TouchableOpacity onPress={() => setFilterVisible(true)} style={styles.headerBtn}>
                            <Feather name="filter" size={16} color={colors.textSecondary} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => router.push("/profile")} style={styles.headerBtn}>
                            <Feather name="user" size={16} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* KPI Grid */}
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

                {/* Victory Native Grouped Bar Chart */}
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

                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={{ height: 300, width: 650 }}>
                            <CartesianChart
                                data={animatedChartData}
                                xKey="month"
                                yKeys={["quantity", "target_quantity"]}
                                domainPadding={{ left: 30, right: 30, top: 40 }}
                                axisOptions={{
                                    font,
                                    tickCount: 6,
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
                                                    points={points.quantity}
                                                    color="#F97316"
                                                    animate={{ type: "timing", duration: 600 }}
                                                />
                                                <BarGroup.Bar
                                                    points={points.target_quantity}
                                                    color="#3B82F6"
                                                    animate={{ type: "timing", duration: 600 }}
                                                />
                                            </BarGroup>

                                            {/* Quantity Labels */}
                                            {points.quantity.map((p, i) => {
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

                                            {/* Target Labels */}
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
                </View>

                {/* List Bar Charts */}
                <BarListTable
                    title="Top Selling Design"
                    data={data.top_selling_design}
                    labelKey="design"
                    valueKey="quantity"
                />

                <BarListTable
                    title="Top Selling SKU's"
                    data={data.top_selling_sku}
                    labelKey="item_description"
                    valueKey="quantity"
                />

                <BarListTable
                    title="Sales Mix by Wheel Size"
                    data={data.sales_mix_by_wheel_size}
                    labelKey="wheel_size"
                    valueKey="total_quantity"
                    percentKey="sales_mix_percentage"
                />

            </ScrollView>

            {/* Filter Modal */}
            <Modal visible={isFilterVisible} animationType="slide" transparent={true} backdropColor={"transparent"} >
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
                                    onPress={() => setTempFilters({ ...tempFilters, financial_year: year })}
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
                                    onPress={() => setTempFilters({ ...tempFilters, month })}
                                >
                                    <Text style={[styles.chipText, tempFilters.month === month && styles.chipTextActive]}>
                                        {month}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TouchableOpacity style={styles.applyBtn} onPress={applyFilters}>
                            <Text style={styles.applyBtnText}>Apply Filters</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    centerBox: { flex: 1, justifyContent: "center", alignItems: "center" },
    scrollContent: { padding: spacing.md, paddingBottom: spacing.xxl },

    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.lg },
    headerTitle: { fontSize: 24, fontFamily: typography.bold, color: colors.text },
    headerSubtitle: { fontSize: txtSize.small, fontFamily: typography.medium, color: colors.textSecondary, marginTop: 2 },
    headerActions: { flexDirection: "row", gap: spacing.sm },
    headerBtn: { padding: 10, backgroundColor: colors.white, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border },

    kpiGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: spacing.lg },
    kpiCard: { width: "48%", backgroundColor: colors.white, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md },
    kpiTitle: { fontSize: 11, fontFamily: typography.medium, color: colors.textSecondary, marginBottom: 8 },
    kpiValue: { fontSize: 18, fontFamily: typography.bold, color: colors.text },

    chartCard: { backgroundColor: colors.white, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.lg },
    chartHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.lg },
    chartTitle: { fontSize: 14, fontFamily: typography.bold, color: colors.text },
    chartLegendRow: { flexDirection: "row", alignItems: "center" },
    legendDot: { width: 10, height: 10, borderRadius: 2, marginRight: 6 },
    legendText: { fontSize: 10, fontFamily: typography.medium, color: colors.textSecondary },

    tableHeaderRow: { flexDirection: "row", paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: colors.border, marginBottom: 8 },
    tableHeaderText: { fontSize: 10, fontFamily: typography.bold, color: colors.muted },
    tableRow: { flexDirection: "row", alignItems: "center", paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.surface },
    tableCellText: { fontSize: 11, fontFamily: typography.medium, color: colors.text, paddingRight: 8 },

    barCellContainer: { height: 24, justifyContent: "center", position: "relative" },
    tableBackgroundBar: { position: "absolute", left: 0, top: 0, bottom: 0, borderRadius: 2, opacity: 0.8 },
    barValueText: { fontSize: 11, fontFamily: typography.bold, color: colors.white, textAlign: "center", zIndex: 1, textShadowColor: 'rgba(0, 0, 0, 0.3)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 },

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
    applyBtn: { backgroundColor: colors.primary, paddingVertical: 14, borderRadius: radius.md, alignItems: 'center', marginTop: spacing.lg },
    applyBtnText: { color: colors.white, fontSize: 16, fontFamily: typography.bold },
});