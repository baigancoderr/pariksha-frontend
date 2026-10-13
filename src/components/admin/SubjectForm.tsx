import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { BilingualInput } from '@/components/ui/BilingualInput';
import { useToast } from '@/hooks/useToast';
import api from '@/lib/api';
import { Subject } from '@/types';

const subjectSchema = z.object({
  name: z.object({
    en: z.string().min(2, 'English name must be at least 2 characters'),
    hi: z.string().optional(),
  }),
  description: z.object({
    en: z.string().optional(),
    hi: z.string().optional(),
  }).optional(),
});

type SubjectFormData = z.infer<typeof subjectSchema>;

interface SubjectFormProps {
  subject: Subject | null;
  examId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const SubjectForm: React.FC<SubjectFormProps> = ({ subject, examId, isOpen, onClose, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nameValue, setNameValue] = useState({ en: '', hi: '' });
  const [descriptionValue, setDescriptionValue] = useState({ en: '', hi: '' });
  const toast = useToast();

  const {
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<SubjectFormData>({
    resolver: zodResolver(subjectSchema),
  });

  useEffect(() => {
    if (subject) {
      setNameValue(subject.name);
      setDescriptionValue(subject.description || { en: '', hi: '' });
    }
  }, [subject]);

  const onSubmit = async (data: SubjectFormData) => {
    try {
      setIsSubmitting(true);

      const payload = {
        exam: examId,
        name: nameValue,
        description: descriptionValue,
      };

      if (subject) {
        await api.patch(`/subjects/${subject._id}`, payload);
        toast.success('Subject updated successfully');
      } else {
        await api.post('/subjects', payload);
        toast.success('Subject created successfully');
      }

      onSuccess();
    } catch (error: any) {
      console.error('Failed to save subject:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to save subject');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={subject ? 'Edit Subject' : 'Create New Subject'}
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
            {subject ? 'Update' : 'Create'} Subject
          </Button>
        </>
      }
    >
      <form className="space-y-6">
        <BilingualInput
          label="Subject Name"
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
            en: 'e.g., Mathematics, Physics',
            hi: 'उदा., गणित, भौतिकी',
          }}
          required
        />

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
            en: 'Brief description of the subject...',
            hi: 'विषय का संक्षिप्त विवरण...',
          }}
          type="textarea"
        />
      </form>
    </Modal>
  );
};
