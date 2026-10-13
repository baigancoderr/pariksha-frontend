import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loader } from '@/components/ui/Loader';
import { AnnouncementTicker } from '@/components/ui/AnnouncementTicker';
import api from '@/lib/api';

const MAX_ANNOUNCEMENT_LENGTH = 500;

interface PublishedMockTest {
  _id: string;
  title: { en: string; hi?: string };
  exam?: { name?: { en?: string } } | string;
}

export const AdminAnnouncement: React.FC = () => {
  const [message, setMessage] = useState('');
  const [targetTest, setTargetTest] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [tests, setTests] = useState<PublishedMockTest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [testsError, setTestsError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const loadAnnouncement = async () => {
      try {
        const response = await api.get('/announcements');
        setMessage(response.data.data.message || '');
        setTargetTest(response.data.data.targetTest || '');
        setTargetUrl(response.data.data.targetUrl || '');
      } catch (loadError) {
        console.error('Failed to load student announcement:', loadError);
        setError('Could not load the current announcement. Please refresh and try again.');
      } finally {
        setIsLoading(false);
      }

      try {
        const response = await api.get('/mock-tests?limit=100');
        setTests(response.data.data || []);
      } catch (loadError) {
        console.error('Failed to load mock tests for announcement links:', loadError);
        setTestsError('Could not load published mock tests.');
      }
    };

    loadAnnouncement();
  }, []);

  const saveAnnouncement = async (nextMessage: string, nextTargetTest: string, nextTargetUrl: string) => {
    try {
      setIsSaving(true);
      setError('');
      setSaved(false);
      const response = await api.put('/announcements', {
        message: nextMessage,
        targetTest: nextTargetTest || null,
        targetUrl: nextTargetUrl.trim() || null,
      });
      setMessage(response.data.data.message);
      setTargetTest(response.data.data.targetTest || '');
      setTargetUrl(response.data.data.targetUrl || '');
      setSaved(true);
    } catch (saveError) {
      console.error('Failed to save student announcement:', saveError);
      setError('Could not save the announcement. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-72 items-center justify-center">
        <Loader size="lg" text="Loading announcement..." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-8xl space-y-6">
      <div>
        <h1 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">Header announcement</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
          Write an update for students. It will scroll between the menu button and notification icon in the student header.
        </p>
      </div>

      <Card title="Announcement message" subtitle="Leave the message blank and save to remove it from the student header.">
        <label htmlFor="student-announcement" className="mb-2 block text-sm font-medium text-gray-700">
          Message for students
        </label>
        <textarea
          id="student-announcement"
          value={message}
          onChange={(event) => {
            setMessage(event.target.value);
            setSaved(false);
          }}
          maxLength={MAX_ANNOUNCEMENT_LENGTH}
          rows={5}
          placeholder="Example: Mock test results will be available by 6 PM today."
          className="block w-full resize-y rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />
        <div className="mt-2 flex items-center justify-between gap-3 text-xs text-gray-500">
          <span>This announcement is visible to all students.</span>
          <span>{message.length}/{MAX_ANNOUNCEMENT_LENGTH}</span>
        </div>

        <label htmlFor="announcement-test" className="mb-2 mt-5 block text-sm font-medium text-gray-700">
          Link to a mock test <span className="font-normal text-gray-500">(optional)</span>
        </label>
        <select
          id="announcement-test"
          value={targetTest}
          onChange={(event) => {
            setTargetTest(event.target.value);
            if (event.target.value) setTargetUrl('');
            setSaved(false);
          }}
          disabled={Boolean(testsError)}
          className="block w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-gray-100"
        >
          <option value="">No test link</option>
          {tests.map((test) => (
            <option key={test._id} value={test._id}>{test.title.en}</option>
          ))}
        </select>
        <p className="mt-2 text-xs text-gray-500">
          When selected, students can click the scrolling announcement or open it from the notification bell to view this test.
        </p>
        <div className="my-5 flex items-center gap-3 text-xs font-medium uppercase tracking-wide text-gray-400">
          <span className="h-px flex-1 bg-gray-200" />
          <span>Or add another link</span>
          <span className="h-px flex-1 bg-gray-200" />
        </div>
        <label htmlFor="announcement-url" className="mb-2 block text-sm font-medium text-gray-700">
          Custom URL <span className="font-normal text-gray-500">(optional)</span>
        </label>
        <input
          id="announcement-url"
          type="url"
          value={targetUrl}
          onChange={(event) => {
            setTargetUrl(event.target.value);
            if (event.target.value) setTargetTest('');
            setSaved(false);
          }}
          maxLength={2048}
          placeholder="https://example.com/important-update"
          className="block w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />
        <p className="mt-2 text-xs text-gray-500">
          Enter a full http:// or https:// link. Selecting a custom URL clears the mock-test selection.
        </p>
        {testsError && (
          <p role="alert" className="mt-3 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {testsError} The announcement can still be saved without a test link.
          </p>
        )}

        {message.trim() && (
          <div className="announcement-track mt-5 overflow-hidden rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-indigo-500">Student preview</p>
            <AnnouncementTicker message={message.trim()} className="text-sm font-medium text-indigo-900" />
          </div>
        )}

        {error && (
          <p role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}
        {saved && (
          <p role="status" className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
            Announcement saved and sent to the student header.
          </p>
        )}

        <div className="mt-6 flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={isSaving || !message}
            onClick={() => {
              setMessage('');
              setTargetTest('');
              setTargetUrl('');
              void saveAnnouncement('', '', '');
            }}
          >
            Clear announcement
          </Button>
          <Button
            type="button"
            isLoading={isSaving}
            disabled={isSaving}
            onClick={() => void saveAnnouncement(message, targetTest, targetUrl)}
          >
            Save announcement
          </Button>
        </div>
      </Card>
    </div>
  );
};
