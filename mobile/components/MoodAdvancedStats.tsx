import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";
import { SkiaLoadingAnimation } from "@/components/ui/SkiaLoadingAnimation";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

interface MoodStat {
  mood: string;
  count: number;
  color: string;
  icon: string;
  percentage: number;
}

interface MoodAdvancedStatsProps {
  visible: boolean;
  onClose: () => void;
  stats: MoodStat[];
  period: string;
}

const { width, height } = Dimensions.get("window");

export default function MoodAdvancedStats({
  visible,
  onClose,
  stats,
  period,
}: MoodAdvancedStatsProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const getPeriodDisplayName = (period: string): string => {
    switch (period) {
      case "currentMonth":
        return "This Month";
      case "last30days":
        return "Last 30 Days";
      case "last7days":
        return "Last 7 Days";
      default:
        return "All Time";
    }
  };

  const getTotalCheckIns = () => {
    return stats.reduce((total, stat) => total + stat.count, 0);
  };

  const getMostFrequentMood = () => {
    if (stats.length === 0) return null;
    return stats.reduce((prev, current) =>
      prev.count > current.count ? prev : current
    );
  };

  const getMoodVariety = () => {
    return stats.filter((stat) => stat.count > 0).length;
  };

  const getAverageCheckInsPerDay = () => {
    const days = period === "last7days" ? 7 : period === "last30days" ? 30 : 30;
    const total = getTotalCheckIns();
    return (total / days).toFixed(1);
  };

  const renderMoodCard = (stat: MoodStat, index: number) => (
    <Animated.View
      key={stat.mood}
      entering={FadeIn.delay(200 + index * 100).duration(400)}
      style={[styles.moodCard, { backgroundColor: stat.color + "20" }]}
    >
      <View style={styles.moodCardHeader}>
        <Ionicons name={stat.icon as any} size={32} color={stat.color} />
        <View style={styles.moodCardInfo}>
          <Text style={[styles.moodCardCount, { color: stat.color }]}>
            {stat.count}
          </Text>
          <Text
            style={[
              styles.moodCardPercentage,
              { color: theme.colors.textSecondary },
            ]}
          >
            {stat.percentage.toFixed(1)}%
          </Text>
        </View>
      </View>
      <Text style={[styles.moodCardName, { color: theme.colors.text }]}>
        {stat.mood.charAt(0).toUpperCase() + stat.mood.slice(1)}
      </Text>
      <View style={styles.moodCardBar}>
        <View
          style={[
            styles.moodCardProgress,
            {
              backgroundColor: stat.color,
              width: `${stat.percentage}%`,
            },
          ]}
        />
      </View>
    </Animated.View>
  );

  const renderDetailCard = (
    title: string,
    value: string | number,
    subtitle: string,
    color: string,
    icon: string
  ) => (
    <Animated.View
      entering={FadeIn.delay(300).duration(400)}
      style={[styles.detailCard, { backgroundColor: color + "20" }]}
    >
      <View style={styles.detailCardHeader}>
        <Ionicons name={icon as any} size={24} color={color} />
        <Text style={[styles.detailCardValue, { color }]}>{value}</Text>
      </View>
      <Text style={[styles.detailCardTitle, { color: theme.colors.text }]}>
        {title}
      </Text>
      <Text
        style={[
          styles.detailCardSubtitle,
          { color: theme.colors.textSecondary },
        ]}
      >
        {subtitle}
      </Text>
    </Animated.View>
  );

  const renderTrendAnalysis = () => {
    const mostFrequent = getMostFrequentMood();
    const totalCheckIns = getTotalCheckIns();

    return (
      <Animated.View
        entering={FadeIn.delay(600).duration(400)}
        style={styles.trendContainer}
      >
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Mood Trends
        </Text>

        <View style={styles.trendCard}>
          <View style={styles.trendHeader}>
            <Ionicons
              name="trending-up-outline"
              size={24}
              color={theme.colors.primary}
            />
            <Text style={[styles.trendTitle, { color: theme.colors.text }]}>
              Dominant Mood
            </Text>
          </View>
          {mostFrequent && (
            <View style={styles.dominantMoodContainer}>
              <Ionicons
                name={mostFrequent.icon as any}
                size={40}
                color={mostFrequent.color}
              />
              <View style={styles.dominantMoodInfo}>
                <Text
                  style={[
                    styles.dominantMoodName,
                    { color: theme.colors.text },
                  ]}
                >
                  {mostFrequent.mood.charAt(0).toUpperCase() +
                    mostFrequent.mood.slice(1)}
                </Text>
                <Text
                  style={[
                    styles.dominantMoodStats,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  {mostFrequent.count} check-ins (
                  {mostFrequent.percentage.toFixed(1)}%)
                </Text>
              </View>
            </View>
          )}
        </View>
      </Animated.View>
    );
  };

  const renderInsights = () => {
    const totalCheckIns = getTotalCheckIns();
    const variety = getMoodVariety();
    const mostFrequent = getMostFrequentMood();

    let insightText = "";
    if (totalCheckIns === 0) {
      insightText = "Start tracking your moods to get personalized insights!";
    } else if (variety === 1) {
      insightText = `You've been consistently feeling ${mostFrequent?.mood}. Consider exploring what's contributing to this pattern.`;
    } else if (variety <= 2) {
      insightText =
        "Your mood patterns show some consistency. Try to identify what triggers different moods.";
    } else {
      insightText = `You've experienced ${variety} different moods. This variety is normal and shows emotional awareness.`;
    }

    return (
      <Animated.View
        entering={FadeIn.delay(800).duration(400)}
        style={styles.insightsContainer}
      >
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Insights
        </Text>
        <View style={styles.insightCard}>
          <Ionicons
            name="bulb-outline"
            size={20}
            color={theme.colors.primary}
          />
          <Text
            style={[styles.insightText, { color: theme.colors.textSecondary }]}
          >
            {insightText}
          </Text>
        </View>
      </Animated.View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Mood Analytics
          </Text>
          <Text
            style={[
              styles.headerSubtitle,
              { color: theme.colors.textSecondary },
            ]}
          >
            {getPeriodDisplayName(period)}
          </Text>
        </View>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Summary Cards */}
          <View style={styles.summaryGrid}>
            {renderDetailCard(
              "Total Check-ins",
              getTotalCheckIns().toString(),
              "Mood recordings",
              theme.colors.primary,
              "checkmark-circle-outline"
            )}
            {renderDetailCard(
              "Daily Average",
              getAverageCheckInsPerDay(),
              "Check-ins per day",
              theme.colors.accent,
              "calendar-outline"
            )}
            {renderDetailCard(
              "Mood Variety",
              getMoodVariety().toString(),
              "Different moods tracked",
              theme.colors.mood.neutral,
              "color-palette-outline"
            )}
            {stats.length > 0 &&
              renderDetailCard(
                "Most Frequent",
                stats[0].mood.charAt(0).toUpperCase() + stats[0].mood.slice(1),
                `${stats[0].count} times`,
                stats[0].color,
                stats[0].icon
              )}
          </View>

          {/* Mood Breakdown */}
          {stats.length > 0 && (
            <Animated.View
              entering={FadeIn.delay(400).duration(400)}
              style={styles.moodBreakdownContainer}
            >
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Mood Breakdown
              </Text>
              <View style={styles.moodGrid}>
                {stats.map((stat, index) => renderMoodCard(stat, index))}
              </View>
            </Animated.View>
          )}

          {/* Trend Analysis */}
          {renderTrendAnalysis()}

          {/* Insights */}
          {renderInsights()}
        </ScrollView>
      </View>
    </Modal>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      padding: 20,
      paddingTop: 60,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      alignItems: "center",
    },
    closeButton: {
      position: "absolute",
      top: 60,
      right: 20,
      padding: 8,
      borderRadius: 20,
      backgroundColor: theme.colors.cardBackground,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 4,
    },
    headerSubtitle: {
      fontSize: 16,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    summaryGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      marginBottom: 30,
    },
    detailCard: {
      width: (width - 60) / 2,
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
      alignItems: "center",
    },
    detailCardHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    detailCardValue: {
      fontSize: 20,
      fontWeight: "bold",
      marginLeft: 8,
    },
    detailCardTitle: {
      fontSize: 14,
      fontWeight: "600",
      textAlign: "center",
      marginBottom: 2,
    },
    detailCardSubtitle: {
      fontSize: 12,
      textAlign: "center",
    },
    moodBreakdownContainer: {
      marginBottom: 30,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 16,
    },
    moodGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
    moodCard: {
      width: (width - 60) / 2,
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
    },
    moodCardHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    moodCardInfo: {
      flex: 1,
      alignItems: "flex-end",
    },
    moodCardCount: {
      fontSize: 24,
      fontWeight: "bold",
    },
    moodCardPercentage: {
      fontSize: 12,
    },
    moodCardName: {
      fontSize: 14,
      fontWeight: "600",
      marginBottom: 8,
    },
    moodCardBar: {
      height: 4,
      backgroundColor: theme.colors.border,
      borderRadius: 2,
      overflow: "hidden",
    },
    moodCardProgress: {
      height: "100%",
      borderRadius: 2,
    },
    trendContainer: {
      marginBottom: 30,
    },
    trendCard: {
      backgroundColor: theme.colors.cardBackground,
      borderRadius: 12,
      padding: 16,
    },
    trendHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
    },
    trendTitle: {
      fontSize: 16,
      fontWeight: "600",
      marginLeft: 12,
    },
    dominantMoodContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    dominantMoodInfo: {
      marginLeft: 16,
      flex: 1,
    },
    dominantMoodName: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 4,
    },
    dominantMoodStats: {
      fontSize: 14,
    },
    insightsContainer: {
      marginBottom: 30,
    },
    insightCard: {
      flexDirection: "row",
      padding: 16,
      backgroundColor: theme.colors.cardBackground,
      borderRadius: 12,
      alignItems: "flex-start",
    },
    insightText: {
      flex: 1,
      fontSize: 14,
      lineHeight: 20,
      marginLeft: 12,
    },
  });
