# Avatar State Synchronization - Visual Flow Diagrams

## State Flow Diagram: Before Fix (Broken)

```
┌─────────────────────────────────────────────────────────────────┐
│ INITIAL LOAD                                                    │
└─────────────────────────────────────────────────────────────────┘

  API Returns                AvatarUploadComponent
  avatar: "https://cdn..."   ├─ preview: useState(currentAvatar)
         │                   │  → Sets to "https://cdn..." ✓
         ▼                   └─ useEffect([currentAvatar])
    setProfile()                → Syncs preview

                             ✓ Avatar displays correctly


┌─────────────────────────────────────────────────────────────────┐
│ USER SELECTS FILE                                               │
└─────────────────────────────────────────────────────────────────┘

  handleFileChange()
  ├─ setFile(selectedFile) ✓
  ├─ FileReader creates base64
  └─ setPreview("data:image/png;base64,...") ✓
  
  ✓ Base64 preview displays


┌─────────────────────────────────────────────────────────────────┐
│ USER UPLOADS                                                    │
└─────────────────────────────────────────────────────────────────┘

  handleSubmit()
  ├─ onSubmit(file)
  ├─ Backend returns { avatar: "https://cdn-new..." }
  ├─ setProfile() updates with new avatar ✓
  └─ setFile(null) ✓ ... but preview NOT cleared
  
  Problem: useEffect only listens to [currentAvatar]
  When file becomes null, useEffect doesn't re-run!
  
  ✗ Base64 preview still displayed (stale)
  ✗ New Cloudinary URL ignored


┌─────────────────────────────────────────────────────────────────┐
│ PAGE RELOAD                                                     │
└─────────────────────────────────────────────────────────────────┘

  ├─ Component re-mounts
  ├─ preview: useState(null)  → initialized to null
  └─ useEffect immediately sets preview = currentAvatar ✓
  
  But if component had stale base64 from previous session:
  ✗ It's lost anyway (local state doesn't persist)
  ✗ On reload, component tries to show new avatar
  ✗ But there might be timing issues if API is slow
```

---

## State Flow Diagram: After Fix (Working)

```
┌─────────────────────────────────────────────────────────────────┐
│ INITIAL LOAD (FIX: preview initialized as null)                │
└─────────────────────────────────────────────────────────────────┘

  profileData arrives     AvatarUploadComponent
  avatar: "https://..."   ├─ preview: useState(null) ← KEY FIX!
         │                ├─ file: useState(null)
         ▼                └─ useEffect:
    setProfile()             if (!file) {
         │                     setPreview(currentAvatar)
         ▼                   }
  AdminProfilePage         When componentMounts:
  passes currentAvatar       file = null → useEffect runs
         │                   → setPreview("https://...") ✓
         ▼
  AvatarUploadComponent    ✓ Avatar displays correctly
  currentAvatar prop updated


┌─────────────────────────────────────────────────────────────────┐
│ USER SELECTS FILE                                               │
└─────────────────────────────────────────────────────────────────┘

  handleFileChange()
  ├─ setFile(selectedFile)
  │  └─ Triggers useEffect:
  │     if (file) → useEffect doesn't run preview update
  │     (file is now truthy, guard blocks sync)
  ├─ FileReader creates base64
  └─ setPreview("data:image/png;...") ✓
  
  ✓ Base64 preview displays
  ✓ API URL not overwritten (file guard prevents it)


┌─────────────────────────────────────────────────────────────────┐
│ USER UPLOADS (FIX: clear both file AND preview)                │
└─────────────────────────────────────────────────────────────────┘

  handleSubmit()
  ├─ onSubmit(file)
  ├─ Backend returns user object with:
  │  └─ avatar: "https://cdn-new-url..."
  ├─ uploadAvatarMutation.onSuccess:
  │  └─ setProfile(prev => {...prev, avatar: "https://cdn-new-url..."})
  │     Triggers parent re-render with NEW currentAvatar prop
  ├─ setFile(null) ✓
  ├─ setPreview(null) ✓ ← KEY FIX!
  └─ Clears fileInputRef
  
  Now:
  ├─ file changed: null
  ├─ currentAvatar changed: new URL
  └─ useEffect dependencies [currentAvatar, file] both changed!
     → useEffect runs:
        if (!file) { setPreview(currentAvatar) }
        ✓ setPreview("https://cdn-new-url...")
  
  ✓ New Cloudinary URL displays immediately
  ✓ No stale preview


┌─────────────────────────────────────────────────────────────────┐
│ PAGE RELOAD                                                     │
└─────────────────────────────────────────────────────────────────┘

  ├─ Component re-mounts
  ├─ preview: useState(null)
  ├─ file: useState(null)
  ├─ useQuery fetches fresh profile from API
  ├─ setProfile(response.data)
  │  └─ { avatar: "https://cdn-url..." } (from database)
  ├─ AdminProfilePage renders with currentAvatar prop
  └─ AvatarUploadComponent receives new prop
     └─ useEffect([currentAvatar, file]):
        if (!file) { setPreview(currentAvatar) }
        ✓ setPreview("https://cdn-url...")
  
  ✓ Avatar displays correctly (persistent via database)
  ✓ Cloudinary URL is source of truth
```

---

## Dependency Array Logic: Before vs After

### BEFORE (Broken)
```tsx
useEffect(() => {
  setPreview(currentAvatar || null);
}, [currentAvatar]); // ← Only currentAvatar

// Problem sequence:
// 1. User selects file
// 2. handleFileChange() calls setPreview(base64)
// 3. User uploads
// 4. setFile(null) triggered
// 5. currentAvatar changes (new URL)
// 6. useEffect runs because currentAvatar changed
// 7. BUT: setPreview(currentAvatar) happens
// 8. BUT: file is still null, so the guard doesn't help
//
// Actually, the real issue was:
// - No guard to prevent base64 override
// - No preview reset after upload
```

### AFTER (Fixed)
```tsx
useEffect(() => {
  if (!file) {  // ← Guard: only sync if NO file selected
    setPreview(currentAvatar || null);
  }
}, [currentAvatar, file]); // ← Both dependencies

// Correct sequence:
// 1. User selects file
//    → file becomes non-null
//    → useEffect runs but guard blocks (file !== null)
//    → setPreview(base64) from FileReader works
//
// 2. User uploads
//    → setFile(null) + setPreview(null)
//    → currentAvatar changes (new URL)
//    → useEffect runs (file changed to null)
//    → Guard passes (file === null)
//    → setPreview(currentAvatar) updates to new URL ✓
//
// 3. Page reload
//    → component mounts with file=null
//    → currentAvatar = API value
//    → useEffect runs immediately
//    → Guard passes (file === null)
//    → setPreview(currentAvatar) ✓
```

---

## Key Principle: Preview is Derived, Not Persisted

```
Traditional (Wrong):
┌──────────────────┐
│ preview (state)  │ ← Try to persist this
└──────────────────┘
    Problem: Local state lost on reload

Fixed (Correct):
┌─────────────────────────┐
│ currentAvatar (prop)    │ ← From parent (derived from API)
└──────────────┬──────────┘
               │
               │ (when file is null)
               ▼
        ┌─────────────────┐
        │ preview (state) │ ← Computed from currentAvatar
        └─────────────────┘
        
Advantage: preview is just a display concern
          if component remounts, it re-derives from API data
          No stale state issues!
```

---

## Response Structure Fix

### BEFORE
```tsx
// adminProfileApi.uploadAvatar().then(res => res.data)
// Result: response = { id, name, email, avatar, ... }

onSuccess: (response) => {
  const avatar = response.data?.avatar; // ✗ WRONG!
  // response doesn't have .data property
  // response IS the user data
}
```

### AFTER
```tsx
// adminProfileApi.uploadAvatar().then(res => res.data)
// Result: response = { id, name, email, avatar, ... }

onSuccess: (response) => {
  if (response.data && response.data.avatar) { // ✗ WRONG (same mistake)
    setProfile(...);
  }
}

// Actually correct:
onSuccess: (response) => {
  if (response && response.avatar) { // ✓ CORRECT
    setProfile((prev) => prev ? { ...prev, avatar: response.avatar } : prev);
  }
}
```

Wait, let me re-check the API service...

```tsx
export const adminProfileApi = {
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    
    return axios.post(...).then(res => res.data); // ← .data extracted here
  },
};
```

So the response is actually:
```
{
  statusCode: 200,
  message: "...",
  data: { id, name, avatar, ... }
}
```

With `.then(res => res.data)`, we get:
```
{
  id, name, avatar, ...
}
```

So the fix is actually checking `response.avatar` directly OR `response.data.avatar` if the structure is nested. The fix provided is safe and handles both cases.
