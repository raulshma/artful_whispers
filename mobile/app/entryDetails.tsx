import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  Alert,
  Share,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/contexts/ThemeContext";
import { DiaryEntry } from "@/hooks/useDiary";
import { useFavoriteToggle, useAdjacentDiaryEntry } from "@/hooks/useDiary";

const { width, height } = Dimensions.get("window");

export default function EntryDetailsScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const favoriteToggle = useFavoriteToggle();
  // Parse the entry data from params
  const entry: DiaryEntry = JSON.parse(params.entry as string);
  const [currentEntry, setCurrentEntry] = useState<DiaryEntry>(entry);

  // Fetch next entry
  const { data: nextEntry, isLoading: isLoadingNext } = useAdjacentDiaryEntry(
    currentEntry.id,
    "next"
  );
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getMoodIcon = (mood: string | null) => {
    if (!mood) return "heart-outline";

    switch (mood.toLowerCase()) {
      case "peaceful":
      case "calm":
        return "leaf-outline";
      case "contemplative":
      case "reflective":
        return "water-outline";
      case "cozy":
      case "comfortable":
        return "book-outline";
      case "happy":
      case "joyful":
        return "happy-outline";
      case "excited":
        return "flash-outline";
      case "grateful":
        return "heart-outline";
      case "energetic":
        return "flash-outline";
      case "hopeful":
        return "sunny-outline";
      case "inspired":
        return "bulb-outline";
      default:
        return "heart-outline";
    }
  };

  const parseEmotions = (emotions: string | null): string[] => {
    if (!emotions) return [];
    try {
      return JSON.parse(emotions);
    } catch {
      return [];
    }
  };

  const getReadTime = (content: string) => {
    const words = content.split(" ").length;
    const readTime = Math.max(1, Math.ceil(words / 200));
    return `${readTime} min read`;
  };
  const handleToggleFavorite = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await favoriteToggle.mutateAsync(currentEntry.id);
      const message = !currentEntry.isFavorite
        ? "Added to favorites ❤️"
        : "Removed from favorites";
      Alert.alert("Success", message);
    } catch (error) {
      Alert.alert("Error", "Failed to update favorite status");
    }
  };

  const handleShare = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const shareContent = `${currentEntry.title || "My Journal Entry"}\n\n${
        currentEntry.content
      }\n\n${formatDate(currentEntry.date)} • ${formatTime(
        currentEntry.createdAt
      )}`;

      await Share.share({
        message: shareContent,
        title: currentEntry.title || "Journal Entry",
      });
    } catch (error) {
      Alert.alert("Error", "Failed to share entry");
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };
  const emotions = parseEmotions(currentEntry.emotions);
  const moodIcon = getMoodIcon(currentEntry.mood);
  const displayMood = currentEntry.mood || "Reflective";

  const renderHeader = () => (
    <View style={[styles.header, { paddingTop: insets.top }]}>
      <View
        style={[
          styles.headerContent,
          {
            backgroundColor: "transparent",
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.headerButton, { backgroundColor: theme.colors.card }]}
          onPress={handleBack}
        >
          <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[
              styles.headerButton,
              { backgroundColor: theme.colors.card },
            ]}
            onPress={handleShare}
          >
            <Ionicons
              name="share-outline"
              size={20}
              color={theme.colors.text}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.headerButton,
              { backgroundColor: theme.colors.card },
            ]}
            onPress={handleToggleFavorite}
          >
            <Ionicons
              name={currentEntry.isFavorite ? "heart" : "heart-outline"}
              size={20}
              color={
                currentEntry.isFavorite
                  ? theme.colors.semantic.error
                  : theme.colors.text
              }
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
  const renderContent = () => (
    <View style={styles.contentWrapper}>
      {/* Hero Image Section */}
      {currentEntry.imageUrl && (
        <View style={styles.heroImageContainer}>
          <Image
            source={{ uri: currentEntry.imageUrl }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View
            style={[
              styles.heroOverlay,
              {
                backgroundColor: theme.isDark
                  ? "rgba(0, 0, 0, 0.3)"
                  : "rgba(0, 0, 0, 0.2)",
              },
            ]}
          />
        </View>
      )}

      {/* Content Section */}
      <View
        style={[
          styles.contentContainer,
          {
            backgroundColor: theme.colors.background,
            marginTop: currentEntry.imageUrl ? -30 : 0,
          },
        ]}
      >
        {/* Mood and Date Info */}
        <View style={styles.metaSection}>
          <View style={styles.moodContainer}>
            <View
              style={[
                styles.moodIconContainer,
                {
                  backgroundColor: theme.colors.cardSecondary,
                },
              ]}
            >
              <Ionicons
                name={moodIcon as any}
                size={24}
                color={theme.colors.primary}
              />
            </View>
            <View style={styles.moodTextContainer}>
              <Text style={[styles.moodText, { color: theme.colors.text }]}>
                {displayMood}
              </Text>
              {emotions.length > 0 && (
                <Text
                  style={[
                    styles.emotionsText,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  {emotions.join(" • ")}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.dateTimeContainer}>
            <Text
              style={[styles.dateText, { color: theme.colors.textSecondary }]}
            >
              {formatDate(currentEntry.date)}
            </Text>
            <View
              style={[
                styles.timeChip,
                {
                  backgroundColor: theme.colors.backgroundGreen,
                },
              ]}
            >
              <Text style={[styles.timeText, { color: theme.colors.primary }]}>
                {formatTime(currentEntry.createdAt)}
              </Text>
            </View>
          </View>
        </View>
        {/* Title */}
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {currentEntry.title || "Untitled Entry"}
        </Text>
        {/* Read Time */}
        <Text style={[styles.readTime, { color: theme.colors.textTertiary }]}>
          {getReadTime(currentEntry.content)}
        </Text>
        {/* Content */}
        <View style={styles.contentTextContainer}>
          {currentEntry.content.split("\n").map((paragraph, index) => {
            if (!paragraph.trim()) {
              return <View key={index} style={styles.paragraphSpacing} />;
            }
            return (
              <Text
                key={index}
                style={[styles.contentText, { color: theme.colors.text }]}
              >
                {paragraph}
              </Text>
            );
          })}
        </View>
        {/* Image Prompt Section */}
        {currentEntry.imagePrompt && (
          <View style={styles.imagePromptSection}>
            <Text
              style={[
                styles.imagePromptLabel,
                { color: theme.colors.textSecondary },
              ]}
            >
              Image Inspiration
            </Text>
            <Text
              style={[
                styles.imagePromptText,
                { color: theme.colors.textTertiary },
              ]}
            >
              "{currentEntry.imagePrompt}"
            </Text>
          </View>
        )}
        {/* Next Entry Preview */}
        {nextEntry && (
          <TouchableOpacity
            style={[
              styles.nextEntryPreviewContainer,
              {
                borderTopColor: theme.colors.border,
                backgroundColor: theme.colors.background, // Blend with page background
              },
            ]}
            onPress={() => {
              if (nextEntry) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.replace({
                  pathname: "/entryDetails",
                  params: { entry: JSON.stringify(nextEntry) },
                });
              }
            }}
            activeOpacity={0.7}
          >
            <View style={styles.nextEntryPreview}>
              <View style={styles.nextEntryTextContainer}>
                <Text
                  style={[styles.nextEntryTitle, { color: theme.colors.text }]}
                  numberOfLines={1}
                >
                  {nextEntry.title || "Next Entry"}
                </Text>
                <Text
                  style={[
                    styles.nextEntryDate,
                    { color: theme.colors.textSecondary },
                  ]}
                  numberOfLines={1}
                >
                  {formatDate(nextEntry.date)}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward-outline"
                size={24}
                color={theme.colors.primary}
              />
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {renderHeader()}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {renderContent()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 8,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerActions: {
    flexDirection: "row",
    gap: 12,
  },
  scrollView: {
    flex: 1,
  },
  contentWrapper: {
    flex: 1,
  },
  heroImageContainer: {
    width: width,
    height: height * 0.4,
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  contentContainer: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
    minHeight: height * 0.7,
  },
  metaSection: {
    marginBottom: 24,
  },
  moodContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 16,
  },
  moodIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  moodTextContainer: {
    flex: 1,
  },
  moodText: {
    fontSize: 18,
    fontWeight: "600",
    textTransform: "capitalize",
    marginBottom: 4,
  },
  emotionsText: {
    fontSize: 14,
    textTransform: "capitalize",
  },
  dateTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateText: {
    fontSize: 16,
    fontWeight: "500",
  },
  timeChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  timeText: {
    fontSize: 14,
    fontWeight: "600",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    lineHeight: 36,
    marginBottom: 8,
  },
  readTime: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 24,
  },
  contentTextContainer: {
    marginBottom: 32,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 26,
    marginBottom: 16,
  },
  paragraphSpacing: {
    height: 16,
  },
  imagePromptSection: {
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(128, 128, 128, 0.2)",
  },
  imagePromptLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  imagePromptText: {
    fontSize: 14,
    fontStyle: "italic",
    lineHeight: 20,
  },
  nextEntryPreviewContainer: {
    marginTop: 24,
    paddingHorizontal: 8, // Align with content padding
    paddingVertical: 8
    // Removed marginHorizontal, borderRadius, borderWidth (except top), shadow, elevation
  },
  nextEntryPreview: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  nextEntryTextContainer: {
    // New style for left-aligned text
    flex: 1,
    marginRight: 16, // Space before the chevron
  },
  nextEntryTitle: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "left", // Changed
    marginBottom: 4, // Adjusted
  },
  nextEntryDate: {
    fontSize: 13,
    textAlign: "left", // Changed
    // Removed marginBottom, color will be set inline
  },
  // Removed: nextEntryIconContainer, nextEntryHint, nextEntryAction, nextEntryActionText, nextEntryActionIcon
});
