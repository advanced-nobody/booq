import React, { useState, useEffect, useCallback } from 'react';
import { UserProfile, Book, ActivityItem } from '../types';
import { BookOpenIcon, QueueListIcon, PencilIcon, CameraIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface ProfilePageProps {
  userProfile: UserProfile;
  books: Book[];
  activityLog: ActivityItem[];
  updateUserProfile: (updatedProfile: Partial<UserProfile>) => void;
}

const formFieldClass = "w-full p-2.5 border border-slate-300 rounded-md bg-white text-slate-700 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 placeholder-slate-400 text-sm";
const labelClass = "block text-sm font-medium text-slate-600 mb-1";

export const ProfilePage: React.FC<ProfilePageProps> = ({ userProfile, books, activityLog, updateUserProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  
  const [editableUsername, setEditableUsername] = useState(userProfile.username);
  const [editableBio, setEditableBio] = useState(userProfile.bio);
  const [editablePronouns, setEditablePronouns] = useState(userProfile.pronouns || '');
  const [editableBirthYear, setEditableBirthYear] = useState<number | undefined>(userProfile.birthYear);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  const resetEditableFields = useCallback(() => {
    setEditableUsername(userProfile.username);
    setEditableBio(userProfile.bio);
    setEditablePronouns(userProfile.pronouns || '');
    setEditableBirthYear(userProfile.birthYear);
    setSelectedImageFile(null);
    setImagePreviewUrl(null); 
  }, [userProfile]);

  useEffect(() => {
    if (!isEditing) {
      resetEditableFields();
    }
  }, [userProfile, isEditing, resetEditableFields]);

  const handleEditToggle = () => {
    if (!isEditing) {
      resetEditableFields();
    }
    setIsEditing(!isEditing);
  };

  const handleCancelEdit = () => {
    resetEditableFields();
    setIsEditing(false);
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async () => {
    let newProfileImageUrl = userProfile.profileImageUrl;

    if (selectedImageFile) {
      newProfileImageUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(selectedImageFile);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
      });
    }

    const updatedProfile: Partial<UserProfile> = {
      username: editableUsername.trim() || userProfile.username, 
      bio: editableBio.trim(),
      pronouns: editablePronouns.trim() || undefined, 
      birthYear: editableBirthYear ? Number(editableBirthYear) : undefined,
      profileImageUrl: newProfileImageUrl,
    };
    
    updateUserProfile(updatedProfile);
    setIsEditing(false);
    setSelectedImageFile(null); 
    setImagePreviewUrl(null); 
  };
  
  const actualFavoriteBooks = books.filter(book => userProfile.favoriteBookIds.includes(book.id)).slice(0,5);
  const sortedActivityLog = [...activityLog].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10);
  const currentUsername = editableUsername || userProfile.username;
  const currentProfileImage = imagePreviewUrl || userProfile.profileImageUrl || `https://ui-avatars.com/api/?name=${currentUsername.replace(/\s+/g, '+')}&background=e2e8f0&color=10B981&size=256&font-size=0.33&bold=true`;


  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-0 space-y-6 sm:space-y-8 text-slate-700">
      <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-100">
        <div className={`flex flex-col items-center space-y-4 md:flex-row md:space-y-0 md:space-x-6 ${isEditing ? 'items-start' : 'items-center'}`}>
          <div className="relative group flex-shrink-0">
            <img
              src={currentProfileImage}
              alt={`Profile picture of ${currentUsername}`}
              className="w-32 h-32 sm:w-36 sm:h-36 rounded-full object-cover border-4 border-emerald-500 shadow-md"
            />
            {isEditing && (
              <label htmlFor="profileImageUpload" className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                <CameraIcon className="w-10 h-10 text-white" />
                <input type="file" id="profileImageUpload" accept="image/*" className="sr-only" onChange={handleImageChange} />
              </label>
            )}
          </div>

          <div className="text-center md:text-left flex-grow w-full">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label htmlFor="username" className={labelClass}>Username:</label>
                  <input type="text" id="username" value={editableUsername} onChange={e => setEditableUsername(e.target.value)} className={formFieldClass} />
                </div>
                <div>
                  <label htmlFor="bio" className={labelClass}>Bio:</label>
                  <textarea id="bio" value={editableBio} onChange={e => setEditableBio(e.target.value)} rows={3} className={formFieldClass} placeholder="Tell something about yourself..."></textarea>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="pronouns" className={labelClass}>Pronouns:</label>
                        <input type="text" id="pronouns" value={editablePronouns} onChange={e => setEditablePronouns(e.target.value)} className={formFieldClass} placeholder="E.g.: she/her, they/them"/>
                    </div>
                    <div>
                        <label htmlFor="birthYear" className={labelClass}>Birth Year:</label>
                        <input type="number" id="birthYear" value={editableBirthYear || ''} onChange={e => setEditableBirthYear(e.target.value ? parseInt(e.target.value) : undefined)} className={formFieldClass} placeholder="E.g.: 1990" min="1900" max={new Date().getFullYear()} />
                    </div>
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-3xl sm:text-4xl font-bold text-emerald-600">{userProfile.username}</h1>
                {userProfile.pronouns && <p className="text-sm text-slate-500 italic">({userProfile.pronouns})</p>}
                {userProfile.bio && <p className="mt-2 text-slate-700 text-sm sm:text-base leading-relaxed">{userProfile.bio}</p>}
                {userProfile.birthYear && <p className="mt-1 text-xs text-slate-400">Born: {userProfile.birthYear}</p>}
              </>
            )}
          </div>
        </div>
        
        <div className="mt-6 flex justify-end space-x-3">
          {isEditing ? (
            <>
              <button
                onClick={handleCancelEdit}
                className="inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md shadow-sm text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              >
                <XMarkIcon className="w-5 h-5 mr-2 text-slate-500" />
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              >
                <CheckIcon className="w-5 h-5 mr-2" />
                Save Changes
              </button>
            </>
          ) : (
            <button
              onClick={handleEditToggle}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              <PencilIcon className="w-5 h-5 mr-2" />
              Edit Profile
            </button>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-100">
        <h2 className="text-xl sm:text-2xl font-semibold text-slate-800 mb-4 flex items-center pb-3 border-b border-slate-200">
          <BookOpenIcon className="w-6 h-6 sm:w-7 sm:h-7 mr-3 text-emerald-500" />
          Favorite Books
        </h2>
        {actualFavoriteBooks.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 sm:gap-4">
            {actualFavoriteBooks.map(book => (
              <div key={book.id} className="text-center group">
                <img 
                  src={book.coverImageUrl || `https://picsum.photos/seed/${book.id}/200/300`} 
                  alt={book.title} 
                  className="w-full h-auto object-cover rounded-md shadow-md aspect-[2/3] transition-transform group-hover:scale-105 border border-slate-200"
                />
                <p className="text-xs mt-1.5 text-slate-500 truncate" title={book.title}>{book.title}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 italic text-sm">You haven't marked any books as favorite yet. Explore and find your next literary gems!</p>
        )}
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-100">
        <h2 className="text-xl sm:text-2xl font-semibold text-slate-800 mb-4 flex items-center pb-3 border-b border-slate-200">
          <QueueListIcon className="w-6 h-6 sm:w-7 sm:h-7 mr-3 text-emerald-500" />
          Recent Activity
        </h2>
         {sortedActivityLog.length > 0 ? (
          <ul className="space-y-3">
            {sortedActivityLog.map(activity => (
              <li key={activity.id} className="p-3 bg-slate-50 rounded-md text-sm border border-slate-100">
                <span className="font-semibold text-emerald-600 capitalize">{activity.type.replace(/_/g, ' ')}</span>
                {activity.bookTitle && <span className="text-slate-700">: "{activity.bookTitle}"</span>}
                {activity.details && <span className="text-slate-500"> - {activity.details}</span>}
                <span className="block text-xs text-slate-400 mt-0.5">{new Date(activity.timestamp).toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-slate-500 italic text-sm">No recent activity to display. Start interacting with your books!</p>
        )}
      </div>
    </div>
  );
};