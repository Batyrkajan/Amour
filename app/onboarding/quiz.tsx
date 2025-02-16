import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { router } from 'expo-router';

type QuizQuestion = {
  id: number;
  question: string;
  options: string[];
};

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "What's your ideal weekend?",
    options: [
      "Outdoor adventures",
      "Cultural activities",
      "Relaxing at home",
      "Social gatherings"
    ]
  },
  // Add more questions as needed
];

export default function QuizScreen() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const handleAnswer = (answer: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestion]: answer }));
    
    if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // Quiz completed, move to profile setup
      router.replace('/onboarding/profile-setup');
    }
  };

  const question = QUIZ_QUESTIONS[currentQuestion];

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.progress}>
        {currentQuestion + 1} / {QUIZ_QUESTIONS.length}
      </Text>
      
      <Text variant="headlineSmall" style={styles.question}>
        {question.question}
      </Text>

      <View style={styles.options}>
        {question.options.map((option, index) => (
          <Button
            key={index}
            mode="outlined"
            style={styles.optionButton}
            onPress={() => handleAnswer(option)}
          >
            {option}
          </Button>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  progress: {
    textAlign: 'center',
    marginBottom: 32,
  },
  question: {
    textAlign: 'center',
    marginBottom: 48,
  },
  options: {
    gap: 16,
  },
  optionButton: {
    paddingVertical: 8,
  },
}); 