import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { TextAreaProps, WordFeedback } from '../utils/types';

/**
 * TextArea Component
 * Displays lesson text with word-level pronunciation feedback highlighting
 */
export const TextArea: React.FC<TextAreaProps> = ({ text, feedback, style }) => {
  // If no feedback, just display the plain text
  if (!feedback || feedback.length === 0) {
    return (
      <View style={[styles.container, style]}>
        <ScrollView style={styles.scrollView}>
          <Text style={styles.plainText}>{text}</Text>
        </ScrollView>
      </View>
    );
  }

  // Split text into words and match with feedback
  const words = text.split(/(\s+)/); // Split by whitespace but keep the whitespace
  const feedbackMap = new Map(feedback.map((f) => [f.word.toLowerCase(), f]));

  return (
    <View style={[styles.container, style]}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.textWrapper}>
          {words.map((word, index) => {
            // If it's whitespace, render it as-is
            if (word.trim() === '') {
              return <Text key={index}>{word}</Text>;
            }

            // Remove punctuation for matching
            const cleanWord = word.toLowerCase().replace(/[.,!?;:]/g, '');
            const wordFeedback = feedbackMap.get(cleanWord);

            if (wordFeedback) {
              const color = wordFeedback.isCorrect ? '#34c759' : '#ff3b30';
              const score = wordFeedback.score !== undefined ? ` (${wordFeedback.score}%)` : '';

              return (
                <Text
                  key={index}
                  style={[
                    styles.highlightedWord,
                    {
                      color,
                      backgroundColor: wordFeedback.isCorrect
                        ? 'rgba(52, 199, 89, 0.1)'
                        : 'rgba(255, 59, 48, 0.1)',
                    },
                  ]}
                >
                  {word}
                </Text>
              );
            }

            // No feedback for this word, render normally
            return (
              <Text key={index} style={styles.normalWord}>
                {word}
              </Text>
            );
          })}
        </View>
      </ScrollView>

      {/* Feedback Legend */}
      {feedback.length > 0 && (
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#34c759' }]} />
            <Text style={styles.legendText}>Doğru</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#ff3b30' }]} />
            <Text style={styles.legendText}>Hatalı</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    minHeight: 150,
    maxHeight: 300,
    borderWidth: 1,
    borderColor: '#e1e4e8',
  },
  scrollView: {
    flex: 1,
  },
  textWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  plainText: {
    fontSize: 18,
    lineHeight: 28,
    color: '#24292e',
    fontWeight: '400',
  },
  normalWord: {
    fontSize: 18,
    lineHeight: 28,
    color: '#24292e',
    fontWeight: '400',
  },
  highlightedWord: {
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '600',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e1e4e8',
    gap: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 13,
    color: '#586069',
    fontWeight: '500',
  },
});

export default TextArea;
