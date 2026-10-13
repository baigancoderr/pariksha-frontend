import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { BilingualInput } from '@/components/ui/BilingualInput';
import { useToast } from '@/hooks/useToast';
import api from '@/lib/api';
import { Question, Exam, Subject, Topic, BilingualText } from '@/types';

const questionSchema = z.object({
  exam: z.string().min(1, 'Exam is required'),
  subject: z.string().min(1, 'Subject is required'),
  topic: z.string().optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  marksCorrect: z.number().min(0),
  marksIncorrect: z.number().max(0),
  tags: z.string().optional(),
});

type QuestionFormData = z.infer<typeof questionSchema>;

interface QuestionFormProps {
  question: Question | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const QuestionForm: React.FC<QuestionFormProps> = ({ question, isOpen, onClose, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [exams, setExams] = useState<Exam[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [questionText, setQuestionText] = useState<BilingualText>({ en: '', hi: '' });
  const [explanation, setExplanation] = useState<BilingualText>({ en: '', hi: '' });
  const [options, setOptions] = useState<Array<{ id: string; text: BilingualText }>>([
    { id: '1', text: { en: '', hi: '' } },
    { id: '2', text: { en: '', hi: '' } },
    { id: '3', text: { en: '', hi: '' } },
    { id: '4', text: { en: '', hi: '' } },
  ]);
  const [correctOption, setCorrectOption] = useState<string>('1');
  const toast = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: question
      ? {
          exam: question.exam,
          subject: question.subject,
          topic: question.topic,
          difficulty: question.difficulty,
          marksCorrect: question.marksCorrect,
          marksIncorrect: question.marksIncorrect,
          tags: question.tags?.join(', '),
        }
      : {
          difficulty: 'MEDIUM',
          marksCorrect: 4,
          marksIncorrect: -1,
        },
  });

  const selectedExam = watch('exam');
  const selectedSubject = watch('subject');

  useEffect(() => {
    fetchExams();
    if (question) {
      setQuestionText(question.questionText);
      setExplanation(question.explanation || { en: '', hi: '' });
      setOptions(question.options);
      setCorrectOption(question.correctOption);
    }
  }, [question]);

  useEffect(() => {
    if (selectedExam) {
      fetchSubjects(selectedExam);
    }
  }, [selectedExam]);

  useEffect(() => {
    if (selectedSubject) {
      fetchTopics(selectedExam, selectedSubject);
    }
  }, [selectedSubject]);

  const fetchExams = async () => {
    try {
      const response = await api.get('/exams');
      if (response.data.success) {
        setExams(response.data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch exams:', error);
    }
  };

  const fetchSubjects = async (examId: string) => {
    try {
      const response = await api.get(`/subjects?exam=${examId}`);
      if (response.data.success) {
        setSubjects(response.data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
    }
  };

  const fetchTopics = async (examId: string, subjectId: string) => {
    try {
      const response = await api.get(`/topics?exam=${examId}&subject=${subjectId}`);
      if (response.data.success) {
        setTopics(response.data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch topics:', error);
    }
  };

  const updateOption = (index: number, text: BilingualText) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], text };
    setOptions(newOptions);
  };

  const onSubmit = async (data: QuestionFormData) => {
    try {
      setIsSubmitting(true);

      // Validation
      if (!questionText.en.trim()) {
        toast.error('Question text (English) is required');
        return;
      }

      if (options.some(opt => !opt.text.en.trim())) {
        toast.error('All option texts (English) are required');
        return;
      }

      const payload = {
        ...data,
        questionText,
        options,
        correctOption,
        explanation,
        tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      };

      if (question) {
        await api.patch(`/questions/${question._id}`, payload);
        toast.success('Question updated successfully');
      } else {
        await api.post('/questions', payload);
        toast.success('Question created successfully');
      }

      onSuccess();
    } catch (error: any) {
      console.error('Failed to save question:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to save question');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={question ? 'Edit Question' : 'Create New Question'}
      size="full"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit(onSubmit)}
            isLoading={isSubmitting}
          >
            {question ? 'Update' : 'Create'} Question
          </Button>
        </>
      }
    >
      <form className="space-y-6 max-h-[70vh] overflow-y-auto px-1">
        {/* Exam, Subject, Topic */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="Exam"
            options={exams.map(e => ({ value: e._id, label: e.name.en }))}
            placeholder="Select Exam"
            error={errors.exam?.message}
            required
            {...register('exam')}
          />
          <Select
            label="Subject"
            options={subjects.map(s => ({ value: s._id, label: s.name.en }))}
            placeholder="Select Subject"
            error={errors.subject?.message}
            disabled={!selectedExam}
            required
            {...register('subject')}
          />
          <Select
            label="Topic"
            options={topics.map(t => ({ value: t._id, label: t.name.en }))}
            placeholder="Select Topic (Optional)"
            error={errors.topic?.message}
            disabled={!selectedSubject}
            {...register('topic')}
          />
        </div>

        {/* Question Text */}
        <BilingualInput
          label="Question Text"
          value={questionText}
          onChange={setQuestionText}
          placeholder={{ en: 'Enter question...', hi: 'प्रश्न दर्ज करें...' }}
          type="textarea"
          required
        />

        {/* Options */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Options <span className="text-red-500">*</span>
          </label>
          {options.map((option, index) => (
            <div key={option.id} className="flex items-start gap-3">
              <input
                type="radio"
                name="correctOption"
                checked={correctOption === option.id}
                onChange={() => setCorrectOption(option.id)}
                className="mt-6"
              />
              <div className="flex-1">
                <BilingualInput
                  label={`Option ${index + 1}`}
                  value={option.text}
                  onChange={(text) => updateOption(index, text)}
                  placeholder={{ en: `Option ${index + 1}...`, hi: `विकल्प ${index + 1}...` }}
                  required
                />
              </div>
            </div>
          ))}
        </div>

        {/* Explanation */}
        <BilingualInput
          label="Explanation"
          value={explanation}
          onChange={setExplanation}
          placeholder={{ en: 'Explain the answer...', hi: 'उत्तर की व्याख्या करें...' }}
          type="textarea"
        />

        {/* Difficulty, Marks, Tags */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select
            label="Difficulty"
            options={[
              { value: 'EASY', label: 'Easy' },
              { value: 'MEDIUM', label: 'Medium' },
              { value: 'HARD', label: 'Hard' },
            ]}
            error={errors.difficulty?.message}
            required
            {...register('difficulty')}
          />
          <Input
            label="Marks (Correct)"
            type="number"
            error={errors.marksCorrect?.message}
            required
            {...register('marksCorrect', { valueAsNumber: true })}
          />
          <Input
            label="Marks (Incorrect)"
            type="number"
            error={errors.marksIncorrect?.message}
            helperText="Use negative values"
            required
            {...register('marksIncorrect', { valueAsNumber: true })}
          />
          <Input
            label="Tags"
            placeholder="tag1, tag2"
            helperText="Comma separated"
            error={errors.tags?.message}
            {...register('tags')}
          />
        </div>
      </form>
    </Modal>
  );
};
