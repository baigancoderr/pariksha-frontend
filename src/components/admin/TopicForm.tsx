import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { BilingualInput } from '@/components/ui/BilingualInput';
import { useToast } from '@/hooks/useToast';
import api from '@/lib/api';
import { Topic } from '@/types';

const topicSchema = z.object({
  name: z.object({
    en: z.string().min(2, 'English name must be at least 2 characters'),
    hi: z.string().optional(),
  }),
  description: z.object({
    en: z.string().optional(),
    hi: z.string().optional(),
  }).optional(),
});

type TopicFormData = z.infer<typeof topicSchema>;

interface TopicFormProps {
  topic: Topic | null;
  examId: string;
  subjectId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const TopicForm: React.FC<TopicFormProps> = ({ topic, examId, subjectId, isOpen, onClose, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nameValue, setNameValue] = useState({ en: '', hi: '' });
  const [descriptionValue, setDescriptionValue] = useState({ en: '', hi: '' });
  const toast = useToast();

  const {
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<TopicFormData>({
    resolver: zodResolver(topicSchema),
  });

  useEffect(() => {
    if (topic) {
      setNameValue(topic.name);
      setDescriptionValue(topic.description || { en: '', hi: '' });
    }
  }, [topic]);

  const onSubmit = async (data: TopicFormData) => {
    try {
      setIsSubmitting(true);

      const payload = {
        exam: examId,
        subject: subjectId,
        name: nameValue,
        description: descriptionValue,
      };

      if (topic) {
        await api.patch(`/topics/${topic._id}`, payload);
        toast.success('Topic updated successfully');
      } else {
        await api.post('/topics', payload);
        toast.success('Topic created successfully');
      }

      onSuccess();
    } catch (error: any) {
      console.error('Failed to save topic:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to save topic');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={topic ? 'Edit Topic' : 'Create New Topic'}
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
            {topic ? 'Update' : 'Create'} Topic
          </Button>
        </>
      }
    >
      <form className="space-y-6">
        <BilingualInput
          label="Topic Name"
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
            en: 'e.g., Algebra, Mechanics',
            hi: 'उदा., बीजगणित, यांत्रिकी',
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
            en: 'Brief description of the topic...',
            hi: 'विषय का संक्षिप्त विवरण...',
          }}
          type="textarea"
        />
      </form>
    </Modal>
  );
};
