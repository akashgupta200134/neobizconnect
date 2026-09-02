import { colors, radius, spacing, txtSize, typography } from "@/constants/theme";
import { Feather } from "@react-native-vector-icons/feather/static";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export const SubDealerIndexScreen = () => {
    const router = useRouter();

    const MENU_OPTIONS = [
        {
            id: "manage",
            title: "Manage Sub Dealers",
            description: "View, register, or update sub-dealer profiles.",
            icon: "users",
            route: "/manage-sub-dealers",
            iconColor: colors.primary,
            iconBg: "#EFF6FF"
        },
        {
            id: "targets",
            title: "Sub Dealers Sales Target",
            description: "Assign and track monthly sales targets for sub-dealers.",
            icon: "target",
            route: "/sub-dealer-targets",
            iconColor: "#16A34A", // green
            iconBg: "#F0FDF4"
        }
    ];

    return (
        <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Sub Dealer Network</Text>
                <Text style={styles.headerSubtitle}>Manage your network and assign targets</Text>
            </View>

            <View style={styles.content}>
                {MENU_OPTIONS.map((option) => (
                    <TouchableOpacity
                        key={option.id}
                        style={styles.card}
                        activeOpacity={0.7}
                        onPress={() => router.push(option.route as any)}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: option.iconBg }]}>
                            <Feather name={option.icon as any} size={24} color={option.iconColor} />
                        </View>
                        
                        <View style={styles.textContainer}>
                            <Text style={styles.cardTitle}>{option.title}</Text>
                            <Text style={styles.cardDesc}>{option.description}</Text>
                        </View>
                        
                        <Feather name="chevron-right" size={20} color={colors.muted} />
                    </TouchableOpacity>
                ))}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { 
        flex: 1, 
        backgroundColor: colors.surface 
    },
    header: { 
        padding: spacing.md, 
        // backgroundColor: colors.white, 
        // borderBottomWidth: 1, 
        // borderBottomColor: colors.border 
    },
    headerTitle: { 
        fontSize: 20, 
        fontFamily: typography.bold, 
        color: colors.text 
    },
    headerSubtitle: { 
        fontSize: txtSize.small, 
        fontFamily: typography.medium, 
        color: colors.textSecondary, 
        marginTop: 2
    },
    content: { 
        padding: spacing.md, 
        gap: spacing.md 
    },
    card: { 
        flexDirection: "row", 
        alignItems: "center", 
        backgroundColor: colors.white, 
        padding: spacing.md, 
        borderRadius: radius.md, 
        borderWidth: 1, 
        borderColor: colors.border 
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: radius.sm,
        justifyContent: "center",
        alignItems: "center",
        marginRight: spacing.md
    },
    textContainer: { 
        flex: 1, 
        paddingRight: spacing.sm 
    },
    cardTitle: { 
        fontSize: 16, 
        fontFamily: typography.bold, 
        color: colors.text, 
        marginBottom: 4 
    },
    cardDesc: { 
        fontSize: 13, 
        fontFamily: typography.medium, 
        color: colors.textSecondary, 
        lineHeight: 18 
    }
});