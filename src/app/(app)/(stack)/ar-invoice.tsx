import { colors, radius, spacing, txtSize, typography } from "@/constants/theme";
import { downloadAndOpenInvoicePdf, fetchArInvoices, fetchArInvoiceStats } from "@/modules/order-history/services/ar-invoice.api";
import { ArInvoiceDocument } from "@/modules/order-history/types";
import { useAuthStore } from "@/store/auth.store";
import { LegendList } from "@legendapp/list/react-native";
import { Feather } from "@react-native-vector-icons/feather/static";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


export default function ArInvoiceScreen() {
  const user = useAuthStore((state) => state.user);
  const groupCompanyName = user?.group_company_name || "Neo";

  const [page, setPage] = useState(0);
  const [selectedDetails, setSelectedDetails] = useState<ArInvoiceDocument | null>(null);
  const [selectedLr, setSelectedLr] = useState<ArInvoiceDocument | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["ar-invoice-stats", groupCompanyName],
    queryFn: () => fetchArInvoiceStats(groupCompanyName),
    enabled: Boolean(groupCompanyName),
  });

  const { data: paginatedData, isLoading: listLoading, isRefetching, refetch } = useQuery({
    queryKey: ["ar-invoice-list", groupCompanyName, page],
    queryFn: () => fetchArInvoices(groupCompanyName, page),
    enabled: Boolean(groupCompanyName),
    placeholderData: (previousData) => previousData, // Keeps old data visible while fetching next page
  });

  const { mutate: handleDownloadPdf } = useMutation({
    mutationFn: (docEntry: string) => downloadAndOpenInvoicePdf(groupCompanyName, docEntry),
    onMutate: (docEntry) => setDownloadingId(docEntry),
    onSuccess: () => setDownloadingId(null),
    onError: (error) => {
      setDownloadingId(null);
      ToastAndroid.show("Failed to open PDF", ToastAndroid.SHORT);
      console.error(error);
    },
  });

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB");
  };

  const renderCard = ({ item }: { item: ArInvoiceDocument }) => {
    const isDownloading = downloadingId === item.invoice_doc_entry;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.docNo}>Invoice #{item.invoice_number}</Text>
            <Text style={styles.docDate}>{formatDate(item.document_date)}</Text>
          </View>
          <View style={[styles.statusBadge, item.invoice_status === "Closed" && styles.statusClosed]}>
            <Text style={[styles.statusBadgeText, item.invoice_status === "Closed" && styles.statusTextClosed]}>
              {item.invoice_status}
            </Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Quantity</Text>
            <Text style={styles.infoValue}>{item.items_quantity}</Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Amount</Text>
            <Text style={styles.infoValue}>₹{parseFloat(item.doc_total).toLocaleString("en-IN")}</Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionButton} onPress={() => setSelectedDetails(item)}>
            <Feather name="eye" size={16} color={colors.text} />
            <Text style={styles.actionText}>View</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDownloadPdf(item.invoice_doc_entry)}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <>
                <Feather name="file-text" size={16} color={colors.primary} />
                <Text style={[styles.actionText, { color: colors.primary }]}>PDF</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => setSelectedLr(item)}>
            <Feather name="truck" size={16} color={colors.success} />
            <Text style={[styles.actionText, { color: colors.success }]}>LR</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.safeArea}>
      {/* Stats Header */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: "#EFF6FF", borderColor: "#BFDBFE" }]}>
          <Text style={styles.statLabel}>Total Invoices</Text>
          {statsLoading ? <ActivityIndicator size="small" /> : (
            <Text style={styles.statValue}>{stats?.total_invoice || 0}</Text>
          )}
          <Feather name="file" size={20} color="#3B82F6" style={styles.statIcon} />
        </View>
        <View style={[styles.statCard, { backgroundColor: "#F0FDF4", borderColor: "#BBF7D0" }]}>
          <Text style={styles.statLabel}>Total Amount</Text>
          {statsLoading ? <ActivityIndicator size="small" /> : (
            <Text style={styles.statValue}>₹{parseFloat(stats?.total_invoice_amount || "0").toLocaleString("en-IN")}</Text>
          )}
          <Feather name="credit-card" size={20} color="#22C55E" style={styles.statIcon} />
        </View>
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Invoice Orders List</Text>
        <Text style={styles.listSubtitle}>Here is a List of Invoice Orders</Text>
      </View>

      {/* Main List */}
      {listLoading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : paginatedData?.content.length === 0 ? (
        <View style={styles.centerBox}>
          <Feather name="inbox" size={48} color={colors.muted} />
          <Text style={styles.emptyTitle}>No invoices found</Text>
        </View>
      ) : (
        <LegendList
          data={paginatedData?.content || []}
          keyExtractor={(item: ArInvoiceDocument) => item.id.toString()}
          estimatedItemSize={180}
          renderItem={renderCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onRefresh={() => { setPage(0); refetch(); }}
          refreshing={isRefetching}
          recycleItems={true}
        />
      )}

      {/* Pagination Footer */}
      {paginatedData && paginatedData.totalItems > 0 && (
        <View style={styles.paginationFooter}>
          <Text style={styles.paginationText}>
            Showing {page * paginatedData.size + 1} to {Math.min((page + 1) * paginatedData.size, paginatedData.totalItems)} of {paginatedData.totalItems} entries
          </Text>
          <View style={styles.paginationControls}>
            <TouchableOpacity
              style={[styles.pageBtn, page === 0 && styles.pageBtnDisabled]}
              disabled={page === 0}
              onPress={() => setPage(p => p - 1)}
            >
              <Feather name="chevron-left" size={18} color={page === 0 ? colors.muted : colors.text} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.pageBtn, paginatedData.isLast && styles.pageBtnDisabled]}
              disabled={paginatedData.isLast}
              onPress={() => setPage(p => p + 1)}
            >
              <Feather name="chevron-right" size={18} color={paginatedData.isLast ? colors.muted : colors.text} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Invoice Details Modal */}
      <Modal visible={Boolean(selectedDetails)} animationType="slide" presentationStyle="pageSheet">
        {selectedDetails && (
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Invoice Details</Text>
                <Text style={styles.modalSubtitle}>Invoice #{selectedDetails.invoice_number}</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedDetails(null)} style={styles.closeButton}>
                <Feather name="x" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalScroll}>
              <View style={styles.modalSummaryRow}>
                <View style={[styles.modalSummaryCard, { backgroundColor: "#EFF6FF" }]}>
                  <Text style={styles.modalSummaryLabel}>Customer</Text>
                  <Text style={styles.modalSummaryMain}>{selectedDetails.customer_name}</Text>
                  <Text style={styles.modalSummarySub}>{selectedDetails.customer_code}</Text>
                </View>
                <View style={[styles.modalSummaryCard, { backgroundColor: "#F0FDF4" }]}>
                  <Text style={styles.modalSummaryLabel}>Posting Date</Text>
                  <Text style={styles.modalSummaryMain}>{formatDate(selectedDetails.posting_date)}</Text>
                </View>
              </View>

              <View style={[styles.modalSummaryCard, { backgroundColor: "#FFF7ED", marginTop: spacing.md }]}>
                <Text style={styles.modalSummaryLabel}>Total Amount</Text>
                <Text style={styles.modalSummaryMain}>₹{parseFloat(selectedDetails.doc_total).toLocaleString("en-IN")}</Text>
                <Text style={styles.modalSummarySub}>Payment Terms: {selectedDetails.payment_terms}</Text>
              </View>

              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Invoice Information</Text>

                <View style={styles.infoGridRow}>
                  <View style={styles.infoGridCol}>
                    <Text style={styles.infoLabel}>Sales Manager</Text>
                    <Text style={styles.infoValue}>{selectedDetails.sales_manager || "-"}</Text>
                  </View>
                  <View style={styles.infoGridCol}>
                    <Text style={styles.infoLabel}>Contact Person</Text>
                    <Text style={styles.infoValue}>{selectedDetails.contact_person || "-"}</Text>
                  </View>
                </View>

                <View style={styles.infoGridRow}>
                  <View style={styles.infoGridCol}>
                    <Text style={styles.infoLabel}>Branch</Text>
                    <Text style={styles.infoValue}>{selectedDetails.branch || "-"}</Text>
                  </View>
                  <View style={styles.infoGridCol}>
                    <Text style={styles.infoLabel}>GSTIN</Text>
                    <Text style={styles.infoValue}>{selectedDetails.gstin || "-"}</Text>
                  </View>
                </View>

                <View style={styles.infoGridRow}>
                  <View style={styles.infoGridCol}>
                    <Text style={styles.infoLabel}>Eway Bill No</Text>
                    <Text style={styles.infoValue}>{selectedDetails.eway_bill_no || "-"}</Text>
                  </View>
                  <View style={styles.infoGridCol}>
                    <Text style={styles.infoLabel}>IRN No</Text>
                    <Text style={styles.infoValueWrapped}>{selectedDetails.irn_no || "-"}</Text>
                  </View>
                </View>

                <View style={styles.infoGridRow}>
                  <View style={styles.infoGridCol}>
                    <Text style={styles.infoLabel}>Ack No</Text>
                    <Text style={styles.infoValue}>{selectedDetails.ack_no || "-"}</Text>
                  </View>
                  <View style={styles.infoGridCol}>
                    <Text style={styles.infoLabel}>Ack Date</Text>
                    <Text style={styles.infoValue}>{formatDate(selectedDetails.ack_date)}</Text>
                  </View>
                </View>

                <View style={styles.infoGridRow}>
                  <View style={styles.infoGridCol}>
                    <Text style={styles.infoLabel}>Freight</Text>
                    <Text style={styles.infoValue}>₹{parseFloat(selectedDetails.freight).toFixed(2)}</Text>
                  </View>
                  <View style={styles.infoGridCol}>
                    <Text style={styles.infoLabel}>Round Off</Text>
                    <Text style={styles.infoValue}>₹{parseFloat(selectedDetails.round_off).toFixed(2)}</Text>
                  </View>
                </View>

                <View style={styles.infoBlock}>
                  <Text style={styles.infoLabel}>Ship To Address</Text>
                  <Text style={styles.infoValue}>{selectedDetails.ship_to_address}</Text>
                </View>
                <View style={styles.infoBlock}>
                  <Text style={styles.infoLabel}>Bill To Address</Text>
                  <Text style={styles.infoValue}>{selectedDetails.bill_to_address}</Text>
                </View>
                <View style={styles.infoBlock}>
                  <Text style={styles.infoLabel}>Remarks</Text>
                  <Text style={styles.infoValue}>{selectedDetails.remarks || "-"}</Text>
                </View>
              </View>

              <View style={styles.infoSection}>
                <View style={styles.productHeader}>
                  <Text style={styles.sectionTitle}>Product Details</Text>
                  <View style={styles.qtyBadge}>
                    <Text style={styles.qtyBadgeText}>Total Qty: {selectedDetails.items_quantity}</Text>
                  </View>
                </View>

                {selectedDetails.items.map((item, index) => (
                  <View key={item.LineNo} style={styles.productRow}>
                    <Text style={styles.productIndex}>{index + 1}</Text>
                    <View style={styles.productDetails}>
                      <Text style={styles.productName}>{item.ItemDescription}</Text>
                      <Text style={styles.productCode}>{item.ItemNo}</Text>
                    </View>
                    <View style={styles.productNumbers}>
                      <Text style={styles.productQty}>Qty: {parseFloat(item.Quantity).toFixed(2)}</Text>
                      <Text style={styles.productPrice}>₹{parseFloat(item.LineTotal).toLocaleString("en-IN")}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>

      {/* LR Details Modal */}
      <Modal visible={Boolean(selectedLr)} transparent animationType="fade">
        {selectedLr && (
          <View style={styles.modalOverlay}>
            <View style={styles.lrCard}>
              <View style={styles.lrHeader}>
                <Text style={styles.modalTitle}>LR Details</Text>
                <TouchableOpacity onPress={() => setSelectedLr(null)}>
                  <Feather name="x" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.lrBody}>
                <View style={styles.lrField}>
                  <Text style={styles.infoLabel}>Invoice No.</Text>
                  <Text style={styles.infoValue}>{selectedLr.invoice_number}</Text>
                </View>
                <View style={styles.lrField}>
                  <Text style={styles.infoLabel}>Invoice Date</Text>
                  <Text style={styles.infoValue}>{formatDate(selectedLr.document_date)}</Text>
                </View>
                <View style={styles.lrField}>
                  <Text style={styles.infoLabel}>Date of Dispatch</Text>
                  <Text style={styles.infoValue}>{formatDate(selectedLr.lr_date)}</Text>
                </View>
                <View style={styles.lrField}>
                  <Text style={styles.infoLabel}>Service Provider</Text>
                  <Text style={styles.infoValue}>{selectedLr.transport_name || "-"}</Text>
                </View>
                <View style={styles.lrField}>
                  <Text style={styles.infoLabel}>LR No.</Text>
                  <Text style={styles.infoValue}>{selectedLr.lrno || "-"}</Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.surface },
  centerBox: { flex: 1, justifyContent: "center", alignItems: "center" },
  statsContainer: { flexDirection: "row", padding: spacing.md, gap: spacing.md },
  statCard: { flex: 1, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, position: "relative", overflow: "hidden" },
  statLabel: { fontSize: 12, fontFamily: typography.medium, color: colors.textSecondary, marginBottom: 4 },
  statValue: { fontSize: 22, fontFamily: typography.bold, color: colors.text },
  statIcon: { position: "absolute", top: 16, right: 16, opacity: 0.2 },
  listHeader: { paddingHorizontal: spacing.md, paddingBottom: spacing.sm },
  listTitle: { fontSize: 18, fontFamily: typography.bold, color: colors.text },
  listSubtitle: { fontSize: txtSize.small, fontFamily: typography.regular, color: colors.textSecondary, marginTop: 2 },
  emptyTitle: { fontSize: txtSize.body, fontFamily: typography.bold, color: colors.text, marginTop: spacing.md },
  listContent: { padding: spacing.md, gap: spacing.md },
  card: { backgroundColor: colors.white, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: spacing.sm, paddingBottom: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  docNo: { fontSize: txtSize.body, fontFamily: typography.bold, color: colors.text },
  docDate: { fontSize: 12, fontFamily: typography.regular, color: colors.muted, marginTop: 2 },
  statusBadge: { backgroundColor: "#DBEAFE", paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.xl },
  statusClosed: { backgroundColor: "#F3F4F6" },
  statusBadgeText: { fontSize: 10, fontFamily: typography.bold, color: "#1D4ED8" },
  statusTextClosed: { color: "#4B5563" },
  cardBody: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.md },
  infoCol: { flex: 1 },
  infoLabel: { fontSize: 11, fontFamily: typography.medium, color: colors.muted, marginBottom: 2 },
  infoValue: { fontSize: 13, fontFamily: typography.semibold, color: colors.text },
  infoValueWrapped: { fontSize: 13, fontFamily: typography.semibold, color: colors.text, flexWrap: "wrap", width: "100%" },
  actionRow: { flexDirection: "row", gap: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.md },
  actionButton: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: colors.surface, paddingVertical: 10, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border },
  actionText: { fontSize: txtSize.small, fontFamily: typography.bold, color: colors.text },
  paginationFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: spacing.md, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.border },
  paginationText: { fontSize: 12, fontFamily: typography.medium, color: colors.textSecondary },
  paginationControls: { flexDirection: "row", gap: spacing.sm },
  pageBtn: { padding: 8, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, backgroundColor: colors.white },
  pageBtnDisabled: { backgroundColor: colors.surface, borderColor: colors.surface },
  modalContainer: { flex: 1, backgroundColor: colors.surface },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: spacing.lg, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border },
  modalTitle: { fontSize: 20, fontFamily: typography.bold, color: colors.text },
  modalSubtitle: { fontSize: 13, fontFamily: typography.medium, color: colors.muted, marginTop: 2 },
  closeButton: { padding: 8, backgroundColor: colors.surface, borderRadius: radius.xl },
  modalScroll: { padding: spacing.md, gap: spacing.md },
  modalSummaryRow: { flexDirection: "row", gap: spacing.md },
  modalSummaryCard: { flex: 1, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  modalSummaryLabel: { fontSize: 11, fontFamily: typography.medium, color: colors.muted, marginBottom: 4 },
  modalSummaryMain: { fontSize: 16, fontFamily: typography.bold, color: colors.text },
  modalSummarySub: { fontSize: 12, fontFamily: typography.regular, color: colors.textSecondary, marginTop: 4 },
  infoSection: { backgroundColor: colors.white, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md },
  sectionTitle: { fontSize: 16, fontFamily: typography.bold, color: colors.text, marginBottom: spacing.md },
  infoGridRow: { flexDirection: "row", marginBottom: spacing.md },
  infoGridCol: { flex: 1, paddingRight: spacing.sm },
  infoBlock: { marginBottom: spacing.md },
  productHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.md, paddingBottom: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  qtyBadge: { backgroundColor: "#EFF6FF", paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.xl },
  qtyBadgeText: { fontSize: 12, fontFamily: typography.bold, color: "#1D4ED8" },
  productRow: { flexDirection: "row", alignItems: "center", paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  productIndex: { width: 24, fontSize: 12, fontFamily: typography.bold, color: colors.muted },
  productDetails: { flex: 1, paddingRight: spacing.sm },
  productName: { fontSize: 13, fontFamily: typography.bold, color: colors.text },
  productCode: { fontSize: 11, fontFamily: typography.regular, color: colors.muted, marginTop: 2 },
  productNumbers: { alignItems: "flex-end" },
  productQty: { fontSize: 12, fontFamily: typography.medium, color: colors.textSecondary },
  productPrice: { fontSize: 13, fontFamily: typography.bold, color: colors.text, marginTop: 2 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center", padding: spacing.xl },
  lrCard: { width: "100%", backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.md },
  lrHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.md, paddingBottom: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  lrBody: { gap: spacing.sm },
  lrField: { padding: spacing.sm, backgroundColor: colors.surface, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border },
});