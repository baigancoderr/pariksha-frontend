import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Loader } from '@/components/ui/Loader';
import { Modal } from '@/components/ui/Modal';
import { SubjectForm } from '@/components/admin/SubjectForm';
import { TopicForm } from '@/components/admin/TopicForm';
import { useToast } from '@/hooks/useToast';
import api from '@/lib/api';
import { Exam, Subject, Topic } from '@/types';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

interface SubjectWithTopics extends Subject {
  topics: Topic[];
  isExpanded?: boolean;
}

export const Subjects: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [subjects, setSubjects] = useState<SubjectWithTopics[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubjectFormOpen, setIsSubjectFormOpen] = useState(false);
  const [isTopicFormOpen, setIsTopicFormOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedSubjectForTopic, setSelectedSubjectForTopic] = useState<string>('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; type: 'subject' | 'topic' } | null>(null);
  const toast = useToast();

  useEffect(() => {
    fetchExams();
  }, []);

  useEffect(() => {
    if (selectedExamId) {
      fetchSubjectsAndTopics();
    }
  }, [selectedExamId]);

  const fetchExams = async () => {
    try {
      const response = await api.get('/exams');
      if (response.data.success) {
        const examList = response.data.data || [];
        setExams(examList);
        if (examList.length > 0) {
          setSelectedExamId(examList[0]._id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch exams:', error);
      toast.error('Failed to load exams');
    }
  };

  const fetchSubjectsAndTopics = async () => {
    try {
      setIsLoading(true);
      const [subjectsRes, topicsRes] = await Promise.all([
        api.get(`/subjects?exam=${selectedExamId}`),
        api.get(`/topics?exam=${selectedExamId}`),
      ]);

      const subjectsList: Subject[] = subjectsRes.data.data || [];
      const topicsList: Topic[] = topicsRes.data.data || [];

      const subjectsWithTopics: SubjectWithTopics[] = subjectsList.map((subject) => ({
        ...subject,
        topics: topicsList
          .filter((topic) => topic.subject === subject._id)
          .sort((a, b) => a.order - b.order),
        isExpanded: false,
      }));

      setSubjects(subjectsWithTopics.sort((a, b) => a.order - b.order));
    } catch (error) {
      console.error('Failed to fetch subjects and topics:', error);
      toast.error('Failed to load subjects and topics');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSubject = (subjectId: string) => {
    setSubjects((prev) =>
      prev.map((s) =>
        s._id === subjectId ? { ...s, isExpanded: !s.isExpanded } : s
      )
    );
  };

  const handleCreateSubject = () => {
    setSelectedSubject(null);
    setIsSubjectFormOpen(true);
  };

  const handleEditSubject = (subject: Subject) => {
    setSelectedSubject(subject);
    setIsSubjectFormOpen(true);
  };

  const handleCreateTopic = (subjectId: string) => {
    setSelectedTopic(null);
    setSelectedSubjectForTopic(subjectId);
    setIsTopicFormOpen(true);
  };

  const handleEditTopic = (topic: Topic) => {
    setSelectedTopic(topic);
    setSelectedSubjectForTopic(topic.subject);
    setIsTopicFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    try {
      if (deleteConfirm.type === 'subject') {
        await api.delete(`/subjects/${deleteConfirm.id}`);
        toast.success('Subject deleted successfully');
      } else {
        await api.delete(`/topics/${deleteConfirm.id}`);
        toast.success('Topic deleted successfully');
      }
      fetchSubjectsAndTopics();
      setDeleteConfirm(null);
    } catch (error: any) {
      console.error('Failed to delete:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to delete');
    }
  };

  const handleToggleActive = async (id: string, type: 'subject' | 'topic', currentStatus: boolean) => {
    try {
      const endpoint = type === 'subject' ? `/subjects/${id}` : `/topics/${id}`;
      await api.patch(endpoint, { isActive: !currentStatus });
      toast.success(`${type === 'subject' ? 'Subject' : 'Topic'} ${!currentStatus ? 'activated' : 'deactivated'}`);
      fetchSubjectsAndTopics();
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, type } = result;

    if (type === 'subject') {
      const newSubjects = Array.from(subjects);
      const [movedSubject] = newSubjects.splice(source.index, 1);
      newSubjects.splice(destination.index, 0, movedSubject);

      setSubjects(newSubjects);

      // Update order on backend
      try {
        await Promise.all(
          newSubjects.map((subject, index) =>
            api.patch(`/subjects/${subject._id}`, { order: index })
          )
        );
        toast.success('Subject order updated');
      } catch (error) {
        console.error('Failed to update order:', error);
        toast.error('Failed to update order');
        fetchSubjectsAndTopics();
      }
    } else if (type === 'topic') {
      const subjectId = result.source.droppableId.replace('topics-', '');
      const subjectIndex = subjects.findIndex((s) => s._id === subjectId);

      if (subjectIndex === -1) return;

      const newSubjects = [...subjects];
      const newTopics = Array.from(newSubjects[subjectIndex].topics);
      const [movedTopic] = newTopics.splice(source.index, 1);
      newTopics.splice(destination.index, 0, movedTopic);

      newSubjects[subjectIndex] = {
        ...newSubjects[subjectIndex],
        topics: newTopics,
      };

      setSubjects(newSubjects);

      // Update order on backend
      try {
        await Promise.all(
          newTopics.map((topic, index) =>
            api.patch(`/topics/${topic._id}`, { order: index })
          )
        );
        toast.success('Topic order updated');
      } catch (error) {
        console.error('Failed to update order:', error);
        toast.error('Failed to update order');
        fetchSubjectsAndTopics();
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader size="lg" text="Loading subjects and topics..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Subject & Topic Management</h1>
          <p className="mt-1 text-sm text-gray-600">Organize exam content in hierarchical structure</p>
        </div>
        <Button variant="primary" onClick={handleCreateSubject} disabled={!selectedExamId}>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Subject
        </Button>
      </div>

      {/* Exam Selector */}
      <Card>
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Select Exam:</label>
          <div className="flex-1 max-w-md">
            <Select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              options={exams.map((exam) => ({
                value: exam._id,
                label: exam.name.en,
              }))}
              placeholder="Choose an exam..."
            />
          </div>
        </div>
      </Card>

      {/* Hierarchical Tree */}
      {!selectedExamId ? (
        <Card>
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-lg font-medium text-gray-900">No Exam Selected</p>
            <p className="mt-1 text-sm text-gray-500">Please select an exam to view its subjects and topics</p>
          </div>
        </Card>
      ) : subjects.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900">No Subjects Yet</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by adding your first subject</p>
            <Button variant="primary" onClick={handleCreateSubject} className="mt-4">
              Add First Subject
            </Button>
          </div>
        </Card>
      ) : (
        <Card padding="none">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="subjects" type="subject">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {subjects.map((subject, index) => (
                    <Draggable key={subject._id} draggableId={subject._id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`border-b border-gray-200 last:border-b-0 ${
                            snapshot.isDragging ? 'bg-indigo-50' : ''
                          }`}
                        >
                          {/* Subject Row */}
                          <div className="flex items-center gap-3 p-4 hover:bg-gray-50">
                            <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing">
                              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                              </svg>
                            </div>

                            <button
                              onClick={() => toggleSubject(subject._id)}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              <svg
                                className={`w-5 h-5 transition-transform ${subject.isExpanded ? 'rotate-90' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>

                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="text-base font-semibold text-gray-900">{subject.name.en}</h3>
                                {subject.name.hi && (
                                  <span className="text-sm text-orange-600">({subject.name.hi})</span>
                                )}
                                <Badge variant={subject.isActive ? 'success' : 'default'} size="sm">
                                  {subject.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  {subject.topics.length} topic{subject.topics.length !== 1 ? 's' : ''}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCreateTopic(subject._id)}
                              >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add Topic
                              </Button>
                              <button
                                onClick={() => handleToggleActive(subject._id, 'subject', subject.isActive)}
                                className={`p-2 rounded-lg transition-colors ${
                                  subject.isActive
                                    ? 'text-orange-600 hover:bg-orange-50'
                                    : 'text-green-600 hover:bg-green-50'
                                }`}
                                title={subject.isActive ? 'Deactivate' : 'Activate'}
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={subject.isActive ? "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" : "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"} />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleEditSubject(subject)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => setDeleteConfirm({ id: subject._id, type: 'subject' })}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>

                          {/* Topics */}
                          {subject.isExpanded && subject.topics.length > 0 && (
                            <Droppable droppableId={`topics-${subject._id}`} type="topic">
                              {(provided) => (
                                <div
                                  {...provided.droppableProps}
                                  ref={provided.innerRef}
                                  className="bg-gray-50"
                                >
                                  {subject.topics.map((topic, topicIndex) => (
                                    <Draggable key={topic._id} draggableId={topic._id} index={topicIndex}>
                                      {(provided, snapshot) => (
                                        <div
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          className={`flex items-center gap-3 p-3 pl-16 border-t border-gray-200 ${
                                            snapshot.isDragging ? 'bg-blue-50' : 'hover:bg-gray-100'
                                          }`}
                                        >
                                          <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing">
                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                            </svg>
                                          </div>

                                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                          </svg>

                                          <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                              <span className="text-sm text-gray-900">{topic.name.en}</span>
                                              {topic.name.hi && (
                                                <span className="text-xs text-orange-600">({topic.name.hi})</span>
                                              )}
                                              <Badge variant={topic.isActive ? 'success' : 'default'} size="sm">
                                                {topic.isActive ? 'Active' : 'Inactive'}
                                              </Badge>
                                            </div>
                                          </div>

                                          <div className="flex items-center gap-2">
                                            <button
                                              onClick={() => handleToggleActive(topic._id, 'topic', topic.isActive)}
                                              className={`p-1.5 rounded-lg transition-colors ${
                                                topic.isActive
                                                  ? 'text-orange-600 hover:bg-orange-50'
                                                  : 'text-green-600 hover:bg-green-50'
                                              }`}
                                            >
                                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={topic.isActive ? "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" : "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"} />
                                              </svg>
                                            </button>
                                            <button
                                              onClick={() => handleEditTopic(topic)}
                                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            >
                                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                              </svg>
                                            </button>
                                            <button
                                              onClick={() => setDeleteConfirm({ id: topic._id, type: 'topic' })}
                                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                              </svg>
                                            </button>
                                          </div>
                                        </div>
                                      )}
                                    </Draggable>
                                  ))}
                                  {provided.placeholder}
                                </div>
                              )}
                            </Droppable>
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </Card>
      )}

      {/* Subject Form Modal */}
      {isSubjectFormOpen && (
        <SubjectForm
          subject={selectedSubject}
          examId={selectedExamId}
          isOpen={isSubjectFormOpen}
          onClose={() => {
            setIsSubjectFormOpen(false);
            setSelectedSubject(null);
          }}
          onSuccess={() => {
            setIsSubjectFormOpen(false);
            setSelectedSubject(null);
            fetchSubjectsAndTopics();
          }}
        />
      )}

      {/* Topic Form Modal */}
      {isTopicFormOpen && (
        <TopicForm
          topic={selectedTopic}
          examId={selectedExamId}
          subjectId={selectedSubjectForTopic}
          isOpen={isTopicFormOpen}
          onClose={() => {
            setIsTopicFormOpen(false);
            setSelectedTopic(null);
            setSelectedSubjectForTopic('');
          }}
          onSuccess={() => {
            setIsTopicFormOpen(false);
            setSelectedTopic(null);
            setSelectedSubjectForTopic('');
            fetchSubjectsAndTopics();
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <Modal
          isOpen={true}
          onClose={() => setDeleteConfirm(null)}
          title={`Delete ${deleteConfirm.type === 'subject' ? 'Subject' : 'Topic'}`}
          footer={
            <>
              <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDelete}>
                Delete
              </Button>
            </>
          }
        >
          <p className="text-gray-700">
            Are you sure you want to delete this {deleteConfirm.type}? 
            {deleteConfirm.type === 'subject' && ' This will also delete all topics and questions under this subject.'}
          </p>
        </Modal>
      )}
    </div>
  );
};
