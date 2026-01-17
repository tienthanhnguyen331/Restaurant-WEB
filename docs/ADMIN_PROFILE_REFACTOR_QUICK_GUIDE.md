# Admin Profile Refactor - Quick Reference

## 📋 What Changed

| Before | After |
|--------|-------|
| All 4 sections visible at once | Collapsible sections (one edits at a time) |
| Forms always visible | Forms only visible when editing |
| Inline Save buttons on each form | Centralized Save/Cancel in SectionCard |
| No visual distinction for active section | Blue highlight + border when editing |
| Edit buttons always enabled | Edit buttons disabled while another section editing |

---

## 🎯 Core Concept

**One Section, One Edit Mode**

```typescript
// Global edit state
const [editingSection, setEditingSection] = useState<'profile' | 'avatar' | 'password' | 'email' | null>(null);

// When user clicks Edit on Profile section:
<button onClick={() => setEditingSection('profile')}>Chỉnh sửa</button>

// Only that section shows form:
<SectionCard isEditing={editingSection === 'profile'}>
  {editingSection === 'profile' && <ProfileInfoForm />}
</SectionCard>
```

---

## 🏗️ Component Structure

### Before
```
AdminProfilePage
├── ProfileInfoForm (with card, buttons, success message)
├── AvatarUploadComponent (with card, buttons, success message)
├── ChangePasswordForm (with card, buttons, success message)
└── ChangeEmailForm (with card, buttons, success message)
```

### After
```
AdminProfilePage
├── SectionCard
│   └── ProfileInfoForm (inputs only)
├── SectionCard
│   └── AvatarUploadComponent (inputs only)
├── SectionCard
│   └── ChangePasswordForm (inputs only)
└── SectionCard
│   └── ChangeEmailForm (inputs only)
```

---

## 🎨 SectionCard Props

```typescript
interface SectionCardProps {
  title: string;           // "Thông Tin Cơ Bản"
  description?: string;    // "Cập nhật tên..."
  isEditing: boolean;      // true = show form
  isLoading?: boolean;     // true = loading spinner
  onEdit: () => void;      // When "Chỉnh sửa" clicked
  onCancel: () => void;    // When "Hủy" clicked
  onSave?: () => void;     // When "Lưu" clicked
  isDisabled?: boolean;    // Disable Edit button?
  children: React.ReactNode; // Form content
}
```

### Usage Example

```tsx
<SectionCard
  title="Thông Tin Cơ Bản"
  description="Cập nhật thông tin tài khoản"
  isEditing={editingSection === 'profile'}
  isLoading={updateProfileMutation.isPending}
  isDisabled={isEditing && editingSection !== 'profile'}
  onEdit={() => setEditingSection('profile')}
  onCancel={() => setEditingSection(null)}
  onSave={() => {
    const form = document.querySelector('[data-section="profile"] form') as HTMLFormElement;
    if (form) form.dispatchEvent(new Event('submit', { bubbles: true }));
  }}
>
  <ProfileInfoForm
    initialData={{ fullName: profile.name, displayName: profile.displayName }}
    onSubmit={updateProfileMutation.mutateAsync}
    isLoading={updateProfileMutation.isPending}
  />
</SectionCard>
```

---

## 🔄 User Flow

```
1. Page loads
   ↓
2. User clicks "Chỉnh sửa" on a section
   → setEditingSection('profile')
   ↓
3. Form appears, section highlights blue
   → isEditing={true}
   ↓
4. User fills form and clicks "Lưu"
   → Form submit triggers mutation
   ↓
5. API responds
   → onSuccess: setEditingSection(null), show success message
   ↓
6. Section collapses, form hidden, message auto-dismisses
```

---

## 📝 Form Component Changes

### Before (ProfileInfoForm)

```tsx
export const ProfileInfoForm = ({ initialData, onSubmit, isLoading }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3>Thông Tin Cơ Bản</h3>
      <form onSubmit={handleSubmit}>
        <FormInput label="Họ tên" ... />
        <button type="submit">Cập Nhật</button>  {/* ← Removed */}
      </form>
    </div>  {/* ← Card removed */}
  );
};
```

### After

```tsx
export const ProfileInfoForm = ({ initialData, onSubmit, isLoading }) => {
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Only inputs, no card/buttons */}
      <FormInput label="Họ tên" ... />
      {errors.submit && <ErrorDiv>{errors.submit}</ErrorDiv>}
    </form>
  );
};
```

**Key changes:**
- ✅ Remove card wrapper (SectionCard handles it)
- ✅ Remove Save button (SectionCard handles it)
- ✅ Remove success message (AdminProfilePage handles it)
- ✅ Keep form validation and submission logic
- ✅ Keep error display

---

## 🎬 State Management

### Success Message Handling

```typescript
// In AdminProfilePage
const [successMessages, setSuccessMessages] = useState<Record<string, string>>({});

// In mutation onSuccess:
onSuccess: () => {
  setProfile(response.data);
  setEditingSection(null);                    // Exit edit mode
  
  // Show success message
  setSuccessMessages(prev => ({
    ...prev,
    profile: 'Thông tin hồ sơ đã được cập nhật!',
  }));
  
  // Auto-dismiss after 3s
  setTimeout(() => {
    setSuccessMessages(prev => ({ ...prev, profile: '' }));
  }, 3000);
}
```

### Rendering Success Message

```tsx
{successMessages.profile && (
  <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded">
    {successMessages.profile}
  </div>
)}
```

---

## 🎮 Button States

### Edit Button (View Mode)
```
Chỉnh sửa
[blue button, enabled]
```

### Save/Cancel Buttons (Edit Mode)
```
Hủy        Lưu
[gray btn]  [green btn with spinner if loading]
```

### Disabled State Example
```typescript
// When one section is editing, others disabled:
const isDisabled = isEditing && editingSection !== 'profile';

<SectionCard
  {...props}
  isDisabled={isDisabled}
  // → Edit button gets disabled={isDisabled}
/>
```

---

## 🔌 Form Submission

### How Save Button Works

```tsx
onSave={() => {
  // Find form inside this section
  const form = document.querySelector('[data-section="profile"] form') as HTMLFormElement;
  
  // Trigger form submit event
  if (form) form.dispatchEvent(new Event('submit', { bubbles: true }));
}}
```

This approach:
1. Finds form by data attribute
2. Triggers submit event
3. Form's `handleSubmit` runs validation
4. If valid, calls `onSubmit(formData)` (mutation)
5. Mutation sends to backend

---

## 📱 Responsive Layout

```
Desktop (md+):
┌─────────────────────┐
│  Profile Overview   │
├─────────────────────┤
│  Basic Info Card    │
├─────────────────────┤
│  Avatar Card        │
├─────────────────────┤
│  Password Card      │
├─────────────────────┤
│  Email Card         │
└─────────────────────┘

Mobile:
[Same, full width]
```

---

## ❌ Common Mistakes

### ❌ Don't do this:

```tsx
// ❌ Form with its own card
<SectionCard>
  <div className="bg-white p-6">  {/* Double wrapping */}
    <ProfileInfoForm />
  </div>
</SectionCard>

// ❌ Form with Save button
export const ProfileInfoForm = () => {
  return (
    <form>
      <input />
      <button type="submit">Save</button>  {/* Duplicate */}
    </form>
  );
};

// ❌ Success message in form
setSuccessMessage('Success!');  // Should be in AdminProfilePage
```

### ✅ Do this:

```tsx
// ✅ Just form content
<SectionCard>
  <ProfileInfoForm />
</SectionCard>

// ✅ Form has only inputs
export const ProfileInfoForm = () => {
  return (
    <form>
      <input />
      {/* No button here */}
    </form>
  );
};

// ✅ Success message in parent
setSuccessMessages(prev => ({ ...prev, profile: 'Success!' }));
```

---

## 🧪 Testing Scenarios

### Test 1: Edit Flow
```
1. Click "Chỉnh sửa" on Profile section
   → Form appears ✓
   → Card highlights blue ✓
   → Other Edit buttons disabled ✓

2. Fill form, click "Lưu"
   → Spinner appears ✓
   → API request sent ✓

3. Success response
   → Form hidden ✓
   → Success message shown ✓
   → Message auto-hides after 3s ✓
```

### Test 2: Cancel Flow
```
1. Click "Chỉnh sửa"
2. Fill form with random data
3. Click "Hủy"
   → Form hidden ✓
   → Data not saved ✓
   → Can click Edit again ✓
```

### Test 3: Error Flow
```
1. Edit password (wrong old password)
2. Click "Lưu"
3. Error response
   → Stay in edit mode ✓
   → Error displays ✓
   → User can retry ✓
```

---

## 📊 File Summary

| File | Changes | Lines |
|------|---------|-------|
| AdminProfilePage.tsx | Complete refactor | ~280 |
| SectionCard.tsx | New component | 80 |
| ProfileInfoForm.tsx | Remove card/buttons | ~50 |
| ChangePasswordForm.tsx | Remove card/buttons | ~30 |
| ChangeEmailForm.tsx | Remove card/buttons | ~30 |
| AvatarUploadComponent.tsx | Remove card/buttons | ~40 |

**Total: 6 files changed/created, 0 breaking changes**

---

## 🚀 Key Advantages

✅ **Better UX** - Clear what's editable vs. view-only  
✅ **Reduced Clutter** - Only one form visible at a time  
✅ **Visual Feedback** - Blue highlight shows active section  
✅ **Reusable Pattern** - SectionCard works for any form  
✅ **Type Safe** - TypeScript ensures correct state  
✅ **No Backend Changes** - API unchanged  
✅ **Clean Separation** - Form logic vs UI logic  

---

## 🔗 Related Files

- [ADMIN_PROFILE_UI_REFACTOR_GUIDE.md](ADMIN_PROFILE_UI_REFACTOR_GUIDE.md) - Full documentation
- [AdminProfilePage.tsx](../packages/frontend/src/features/admin-profile/AdminProfilePage.tsx)
- [SectionCard.tsx](../packages/frontend/src/features/admin-profile/components/SectionCard.tsx)
