import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { BilingualInput } from '@/components/ui/BilingualInput';
import { useToast } from '@/hooks/useToast';
import api from '@/lib/api';
import { Exam } from '@/types';

const examSchema = z.object({
  name: z.object({
    en: z.string().min(3, 'English name must be at least 3 characters'),
    hi: z.string().optional(),
  }),
  code: z.string().min(2, 'Code must be at least 2 characters').toUpperCase(),
  slug: z.string().min(2, 'Slug must be at least 2 characters'),
  category: z.string().min(2, 'Category is required'),
  description: z.object({
    en: z.string().optional(),
    hi: z.string().optional(),
  }).optional(),
});

type ExamFormData = z.infer<typeof examSchema>;

interface ExamFormProps {
  exam: Exam | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ExamForm: React.FC<ExamFormProps> = ({ exam, isOpen, onClose, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nameValue, setNameValue] = useState({ en: '', hi: '' });
  const [descriptionValue, setDescriptionValue] = useState({ en: '', hi: '' });
  const toast = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ExamFormData>({
    resolver: zodResolver(examSchema),
    defaultValues: exam
      ? {
          name: exam.name,
          code: exam.code,
          slug: exam.slug,
          category: exam.category,
          description: exam.description,
        }
      : {
          name: { en: '', hi: '' },
          code: '',
          slug: '',
          category: '',
          description: { en: '', hi: '' },
        },
  });

  useEffect(() => {
    if (exam) {
      setNameValue(exam.name);
      setDescriptionValue(exam.description || { en: '', hi: '' });
    }
  }, [exam]);

  // Auto-generate slug from code
  const codeValue = watch('code');
  useEffect(() => {
    if (codeValue && !exam) {
      const slug = codeValue.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      setValue('slug', slug);
    }
  }, [codeValue, exam, setValue]);

  const onSubmit = async (data: ExamFormData) => {
    try {
      setIsSubmitting(true);

      const payload = {
        ...data,
        name: nameValue,
        description: descriptionValue,
      };

      if (exam) {
        await api.patch(`/exams/${exam._id}`, payload);
        toast.success('Exam updated successfully');
      } else {
        await api.post('/exams', payload);
        toast.success('Exam created successfully');
      }

      onSuccess();
    } catch (error: any) {
      console.error('Failed to save exam:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to save exam');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={exam ? 'Edit Exam' : 'Create New Exam'}
      size="lg"
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
            {exam ? 'Update' : 'Create'} Exam
          </Button>
        </>
      }
    >
      <form className="space-y-6">
        {/* Bilingual Name */}
        <BilingualInput
          label="Exam Name"
          value={nameValue}
          onChange={(value) => {
            setNameValue(value);
            setValue('name', value);
          }}
          error={{
            en: errors.name?.en?.message,
            hi: errors.name?.hi?.message,
          }}
          placeholder={{
            en: 'e.g., Joint Entrance Examination',
            hi: 'उदा., संयुक्त प्रवेश परीक्षा',
          }}
          required
        />

        {/* Code and Slug */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Exam Code"
            placeholder="e.g., JEE"
            error={errors.code?.message}
            helperText="Short unique code (auto-converts to uppercase)"
            required
            {...register('code')}
          />

          <Input
            label="Slug"
            placeholder="e.g., jee"
            error={errors.slug?.message}
            helperText="URL-friendly identifier (auto-generated from code)"
            required
            {...register('slug')}
          />
        </div>

        {/* Category */}
        <Input
          label="Category"
          placeholder="e.g., Engineering, Medical, Banking"
          error={errors.category?.message}
          helperText="Exam category or domain"
          required
          {...register('category')}
        />

        {/* Bilingual Description */}
        <BilingualInput
          label="Description"
          value={descriptionValue}
          onChange={(value) => {
            setDescriptionValue(value);
            setValue('description', value);
          }}
          error={{
            en: errors.description?.en?.message,
            hi: errors.description?.hi?.message,
          }}
          placeholder={{
            en: 'Brief description of the exam...',
            hi: 'परीक्षा का संक्षिप्त विवरण...',
          }}
          type="textarea"
        />

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="ml-3">
              <h4 className="text-sm font-semibold text-blue-900">Important Notes</h4>
              <ul className="mt-2 text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Exam code must be unique across the system</li>
                <li>Slug is auto-generated but can be customized</li>
                <li>Hindi translation is optional but recommended for better accessibility</li>
                <li>You can publish the exam later from the exam list</li>
              </ul>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
};
