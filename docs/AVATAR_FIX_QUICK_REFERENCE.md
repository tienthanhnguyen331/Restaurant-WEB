# Avatar Persistence Fix - Quick Reference

## The Bug
Avatar preview disappeared after page reload or re-login, even though upload succeeded.

## The Cause
1. **Base64 preview stored as local state** → Lost on reload
2. **No file guard in useEffect** → API URL didn't sync after upload
3. **Preview not cleared after upload** → useEffect never re-fired
4. **Response structure mismatch** → Avatar URL not extracted correctly

## The Fix (3 Changes)

### 1️⃣ AvatarUploadComponent: Initialize preview as null
```tsx
// Before:
const [preview, setPreview] = useState<string | null>(currentAvatar || null);

// After:
const [preview, setPreview] = useState<string | null>(null);
```

### 2️⃣ AvatarUploadComponent: Add file guard to useEffect
```tsx
// Before:
useEffect(() => {
  setPreview(currentAvatar || null);
}, [currentAvatar]);

// After:
useEffect(() => {
  if (!file) {  // ← Guard: only sync when no file selected
    setPreview(currentAvatar || null);
  }
}, [currentAvatar, file]); // ← Both dependencies
```

**Why this works:**
- During file selection: base64 preview displayed (guard blocks API URL)
- After upload: both `file` and `preview` cleared → useEffect re-fires → syncs new URL

### 3️⃣ AvatarUploadComponent: Clear preview after upload
```tsx
// Before:
await onSubmit(file);
setFile(null);
if (fileInputRef.current) fileInputRef.current.value = '';

// After:
await onSubmit(file);
setFile(null);
setPreview(null); // ← NEW: Force useEffect to re-sync
if (fileInputRef.current) fileInputRef.current.value = '';
```

### 4️⃣ AdminProfilePage: Fix response extraction
```tsx
// Before:
onSuccess: (response) => {
  const avatar = response.data?.avatar; // Wrong nesting
  if(!avatar) return;
  setProfile((prev) => prev ? { ...prev, avatar } : prev);
}

// After:
onSuccess: (response) => {
  // response.data is the full user object from backend
  if (response.data && response.data.avatar) {
    setProfile((prev) => prev ? { ...prev, avatar: response.data.avatar } : prev);
  }
}
```

## Data Flow After Fix

```
Load Page
  ↓
API returns avatar URL from database
  ↓
AvatarUploadComponent receives currentAvatar prop
  ↓
useEffect: if (!file) setPreview(currentAvatar)
  ↓
Avatar displays ✓

User selects file
  ↓
handleFileChange: setPreview(base64)
  ↓
Base64 preview displays ✓

User uploads
  ↓
Backend stores URL, returns user object
  ↓
setFile(null) + setPreview(null)
  ↓
useEffect fires (both dependencies changed)
  ↓
Guard passes: if (!file) setPreview(currentAvatar) with NEW URL
  ↓
New avatar displays ✓

Page reload
  ↓
useQuery refetches profile from API
  ↓
API returns avatar URL from database (persisted)
  ↓
Back to "Load Page" flow ✓
```

## Key Principles

| Principle | Benefit |
|-----------|---------|
| **Cloudinary URL = Source of Truth** | Never rely on local base64 state |
| **File Guard** | Separate concerns: file preview vs API URL |
| **Derived State** | preview computed from props, not persisted |
| **Proper Cleanup** | Both file and preview cleared after upload |
| **Correct Dependencies** | Both file and currentAvatar trigger re-sync |

## Testing
- ✓ Initial load shows avatar from database
- ✓ File selection shows base64 preview
- ✓ After upload, shows new Cloudinary URL immediately
- ✓ Page reload/re-login: avatar persists from database
- ✓ Multiple uploads work correctly

## Files Changed
- `packages/frontend/src/features/admin-profile/components/AvatarUploadComponent.tsx`
- `packages/frontend/src/features/admin-profile/AdminProfilePage.tsx`
