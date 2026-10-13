import { useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import { API_BASE_URL } from '@/config/constants';
import api from '@/lib/api';
import type { User, UserSocialLinks } from '@/types';
import { AdminLayout } from '@/layouts/AdminLayout';
import { StudentLayout } from '@/layouts/StudentLayout';

const socialFields: { key: keyof UserSocialLinks; label: string; placeholder: string }[] = [
  { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/username' },
  { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/username' },
  { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/username' },
  { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@channel' },
  { key: 'website', label: 'Website', placeholder: 'https://example.com' },
];

const apiOrigin = API_BASE_URL.replace(/\/api\/v1\/?$/, '');

export function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState('');
  const [socialLinks, setSocialLinks] = useState<UserSocialLinks>({});
  const [avatarUrl, setAvatarUrl] = useState('');
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let active = true;
    api.get('/users/me')
      .then((response) => {
        if (!active) return;
        const profile = response.data.data as User;
        setName(profile.name);
        setSocialLinks(profile.socialLinks || {});
        setAvatarUrl(profile.avatarUrl || '');
        updateUser({ ...(user || profile), ...profile });
      })
      .catch((requestError) => {
        if (!active) return;
        console.error('Failed to load profile:', requestError);
        setError(requestError.response?.data?.error?.message || 'Failed to load profile.');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!photo) {
      setSelectedPhotoUrl('');
      return;
    }
    const objectUrl = URL.createObjectURL(photo);
    setSelectedPhotoUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [photo]);

  const updateSocialLink = (key: keyof UserSocialLinks, value: string) => {
    setSocialLinks((current) => ({ ...current, [key]: value }));
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setIsSaving(true);
    try {
      const response = await api.patch('/users/me', { name: name.trim(), socialLinks });
      const profile = response.data.data as User;
      setName(profile.name);
      setSocialLinks(profile.socialLinks || {});
      updateUser({ ...(user || profile), ...profile });
      setSuccess('Profile updated successfully.');
    } catch (requestError: any) {
      console.error('Failed to update profile:', requestError);
      setError(requestError.response?.data?.error?.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoUpload = async () => {
    if (!photo) return;
    setError('');
    setSuccess('');
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('photo', photo);
      const response = await api.post('/users/me/avatar', formData);
      const profile = response.data.data as User;
      setAvatarUrl(profile.avatarUrl || '');
      updateUser({ ...(user || profile), ...profile });
      setPhoto(null);
      setSuccess('Profile photo updated successfully.');
    } catch (requestError: any) {
      console.error('Failed to upload profile photo:', requestError);
      setError(requestError.response?.data?.error?.message || 'Failed to upload profile photo.');
    } finally {
      setIsSaving(false);
    }
  };

  const imageUrl = selectedPhotoUrl || (avatarUrl ? `${apiOrigin}${avatarUrl}` : '');

  const profileForm = (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your name, profile photo, and social links.</p>
      </div>

      {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {success && <p role="status" className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{success}</p>}

      {isLoading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500">Loading profile...</div>
      ) : (
        <>
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Profile photo</h2>
            <div className="mt-4 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Profile"
                  onError={() => {
                    setError('Photo uploaded, but could not be loaded. Please restart the API server and try again.');
                    setAvatarUrl('');
                  }}
                  className="h-24 w-24 rounded-full object-cover ring-2 ring-gray-100"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-indigo-100 text-3xl font-semibold text-indigo-700">
                  {name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) => setPhoto(event.target.files?.[0] || null)}
                  className="block w-full max-w-sm text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
                />
                <p className="text-xs text-gray-500">JPG, PNG, or WebP. Maximum size 2 MB.</p>
                {photo && (
                  <button
                    type="button"
                    onClick={handlePhotoUpload}
                    disabled={isSaving}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
                  >
                    {isSaving ? 'Uploading...' : 'Upload photo'}
                  </button>
                )}
              </div>
            </div>
          </section>

          <form onSubmit={handleSave} className="space-y-6">
            <section className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">Personal information</h2>
              <label className="block text-sm font-medium text-gray-700">
                Name
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  minLength={2}
                  maxLength={120}
                  required
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </label>
              <label className="block text-sm font-medium text-gray-700">
                Email
                <input
                  value={user?.email || ''}
                  readOnly
                  className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-500"
                />
              </label>
            </section>

            <section className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">Social media links</h2>
              {socialFields.map((field) => (
                <label key={field.key} className="block text-sm font-medium text-gray-700">
                  {field.label}
                  <input
                    type="url"
                    value={socialLinks[field.key] || ''}
                    onChange={(event) => updateSocialLink(field.key, event.target.value)}
                    placeholder={field.placeholder}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </label>
              ))}
            </section>

            <button
              type="submit"
              disabled={isSaving}
              className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? 'Saving...' : 'Save profile'}
            </button>
          </form>
        </>
      )}
    </div>
  );

  return user?.role === 'ADMIN'
    ? <AdminLayout>{profileForm}</AdminLayout>
    : <StudentLayout>{profileForm}</StudentLayout>;
}
