import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Question } from '@/types';

interface QuestionPreviewProps {
  question: Question;
  isOpen: boolean;
  onClose: () => void;
}

export const QuestionPreview: React.FC<QuestionPreviewProps> = ({ question, isOpen, onClose }) => {
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [showAnswer, setShowAnswer] = useState(false);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY': return 'success';
      case 'MEDIUM': return 'warning';
      case 'HARD': return 'danger';
      default: return 'default';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Question Preview"
      size="xl"
    >
      <div className="space-y-6">
        {/* Language Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant={getDifficultyColor(question.difficulty)}>
              {question.difficulty}
            </Badge>
            <span className="text-sm text-gray-600">
              +{question.marksCorrect} / {question.marksIncorrect}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1 text-sm rounded-lg ${
                language === 'en'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🇬🇧 English
            </button>
            {question.questionText.hi && (
              <button
                onClick={() => setLanguage('hi')}
                className={`px-3 py-1 text-sm rounded-lg ${
                  language === 'hi'
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🇮🇳 हिंदी
              </button>
            )}
          </div>
        </div>

        {/* Question Text */}
        <div className="bg-gray-50 rounded-lg p-6">
          <p className="text-lg text-gray-900 whitespace-pre-wrap">
            {language === 'en' ? question.questionText.en : (question.questionText.hi || question.questionText.en)}
          </p>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {question.options.map((option, index) => {
            const isCorrect = option.id === question.correctOption;
            const optionText = language === 'en' ? option.text.en : (option.text.hi || option.text.en);
            
            return (
              <div
                key={option.id}
                className={`p-4 rounded-lg border-2 ${
                  showAnswer && isCorrect
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-medium">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <p className="flex-1 text-gray-900">{optionText}</p>
                  {showAnswer && isCorrect && (
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Show Answer Button */}
        <div className="flex justify-center">
          <button
            onClick={() => setShowAnswer(!showAnswer)}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            {showAnswer ? 'Hide Answer' : 'Show Answer'}
          </button>
        </div>

        {/* Explanation */}
        {showAnswer && question.explanation && (question.explanation.en || question.explanation.hi) && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">Explanation</h4>
            <p className="text-sm text-blue-800 whitespace-pre-wrap">
              {language === 'en' ? question.explanation.en : (question.explanation.hi || question.explanation.en)}
            </p>
          </div>
        )}

        {/* Tags */}
        {question.tags && question.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {question.tags.map((tag, index) => (
              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};
