# SectionCard Component - Visual & Code Reference

## 📐 Component Structure

### View Mode (Collapsed)

```
┌────────────────────────────────────────────┐
│ Title                        [Edit Button] │
│ Description (optional)                     │
└────────────────────────────────────────────┘
```

**CSS Classes:**
- Container: `bg-white border border-gray-200 rounded-lg shadow`
- Title: `text-lg font-semibold text-gray-900`
- Description: `text-sm text-gray-600 mt-1`
- Button: `bg-blue-600 text-white hover:bg-blue-700`

### Edit Mode (Expanded)

```
┌────────────────────────────────────────────┐
│ Title                    [Cancel] [Save]   │
│ Description (optional)                     │
├────────────────────────────────────────────┤
│                                            │
│  Form Content Goes Here                    │
│  (ProfileInfoForm, ChangePasswordForm, etc)│
│                                            │
│  ✅ Success Message (if applicable)        │
└────────────────────────────────────────────┘
```

**CSS Classes:**
- Container: `bg-blue-50 border-2 border-blue-500 ring-2 ring-blue-200`
- Cancel Button: `border border-gray-300 text-gray-700 hover:bg-gray-50`
- Save Button: `bg-green-600 text-white hover:bg-green-700`
- Save with loading: Shows spinner + "Đang lưu..."

---

## 💻 Complete SectionCard Code

```tsx
import React from 'react';

interface SectionCardProps {
  title: string;
  description?: string;
  isEditing: boolean;
  isLoading?: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave?: () => void;
  isDisabled?: boolean;
  children: React.ReactNode;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  title,
  description,
  isEditing,
  isLoading = false,
  onEdit,
  onCancel,
  onSave,
  isDisabled = false,
  children,
}) => {
  return (
    <div
      className={`rounded-lg shadow transition-all ${
        isEditing
          ? 'bg-blue-50 border-2 border-blue-500 ring-2 ring-blue-200'
          : 'bg-white border border-gray-200'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
        </div>

        <div className="flex gap-2 ml-4">
          {!isEditing ? (
            // View Mode: Edit Button
            <button
              onClick={onEdit}
              disabled={isDisabled}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              Chỉnh sửa
            </button>
          ) : (
            // Edit Mode: Cancel & Save Buttons
            <>
              <button
                onClick={onCancel}
                disabled={isLoading}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                Hủy
              </button>
              <button
                onClick={onSave}
                disabled={isLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                    Đang lưu...
                  </>
                ) : (
                  'Lưu'
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className={`p-6 transition-all ${isEditing ? 'block' : 'hidden'}`}>
        {children}
      </div>
    </div>
  );
};
```

---

## 🎯 Button States Reference

### Edit Button States

| State | Class | Cursor |
|-------|-------|--------|
| Enabled | `bg-blue-600 hover:bg-blue-700` | pointer |
| Disabled | `bg-gray-400 disabled:cursor-not-allowed` | not-allowed |

### Cancel Button States

| State | Class | Cursor |
|-------|-------|--------|
| Enabled | `border border-gray-300 hover:bg-gray-50` | pointer |
| Disabled | `opacity-50 disabled:cursor-not-allowed` | not-allowed |

### Save Button States

| State | Class | Content |
|-------|-------|---------|
| Enabled | `bg-green-600 hover:bg-green-700` | "Lưu" |
| Loading | `bg-gray-400` | Spinner + "Đang lưu..." |
| Disabled | `bg-gray-400` | "Lưu" |

---

## 🔄 State Transitions

```
View Mode
  ↓
[User clicks "Chỉnh sửa"]
  ↓
setEditingSection('profile')
  ↓
isEditing = true
  ↓
Edit Mode
├─ Form visible
├─ Blue background
├─ Cancel & Save buttons shown
└─ Other sections disabled
  ↓
[User clicks "Lưu"]
  ↓
isLoading = true
  ↓
Spinner shows on Save button
  ↓
[API response success]
  ↓
isLoading = false
  ↓
setEditingSection(null)
  ↓
View Mode (cycle repeats)
```

---

## 🎨 TailwindCSS Color Scheme

### Background Colors
- View: `bg-white`
- Edit: `bg-blue-50`

### Border Colors
- View: `border border-gray-200`
- Edit: `border-2 border-blue-500`

### Ring Effect (Edit Mode)
- `ring-2 ring-blue-200` (subtle blue ring)

### Button Colors
- Edit: `bg-blue-600 hover:bg-blue-700`
- Save: `bg-green-600 hover:bg-green-700`
- Cancel: `border border-gray-300 hover:bg-gray-50`
- Disabled: `bg-gray-400 disabled:cursor-not-allowed`

### Text Colors
- Title: `text-gray-900`
- Description: `text-gray-600`
- Button text: `text-white` (Edit/Save), `text-gray-700` (Cancel)

---

## 📐 Layout & Spacing

### Container
```
Padding: p-6 (1.5rem on all sides)
Gap between buttons: gap-2
Header margin: ml-4 (left margin before buttons)
```

### Typography
```
Title: text-lg (18px), font-semibold, text-gray-900
Description: text-sm (14px), text-gray-600, mt-1 (top margin)
Button text: text-sm font-medium
```

### Responsive
```
Header: flex items-center justify-between
Buttons: flex gap-2 ml-4 (flexbox with gap)
Title area: flex-1 (takes remaining space)
```

---

## 🔗 Integration Example

### In AdminProfilePage

```tsx
<SectionCard
  // Display
  title="Thông Tin Cơ Bản"
  description="Cập nhật tên hiển thị và tên đầy đủ"
  
  // State
  isEditing={editingSection === 'profile'}
  isLoading={updateProfileMutation.isPending}
  isDisabled={isEditing && editingSection !== 'profile'}
  
  // Handlers
  onEdit={() => setEditingSection('profile')}
  onCancel={() => setEditingSection(null)}
  onSave={() => {
    const form = document.querySelector('[data-section="profile"] form') as HTMLFormElement;
    if (form) form.dispatchEvent(new Event('submit', { bubbles: true }));
  }}
>
  {/* Form Component Goes Here */}
  <ProfileInfoForm
    initialData={{ fullName: profile.name, displayName: profile.displayName }}
    onSubmit={updateProfileMutation.mutateAsync}
    isLoading={updateProfileMutation.isPending}
  />
</SectionCard>

{/* Success Message Below */}
{successMessages.profile && (
  <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded text-sm">
    {successMessages.profile}
  </div>
)}
```

---

## 🧪 Testing Props Combinations

### View Mode
```tsx
<SectionCard
  title="Test"
  isEditing={false}
  onEdit={() => {}}
  onCancel={() => {}}
  isDisabled={false}
>
  <div>Content</div>
</SectionCard>
// Shows: "Chỉnh sửa" button, no form
```

### Edit Mode
```tsx
<SectionCard
  title="Test"
  isEditing={true}
  onEdit={() => {}}
  onCancel={() => {}}
  onSave={() => {}}
>
  <div>Form here</div>
</SectionCard>
// Shows: "Hủy" and "Lưu" buttons, form visible
```

### Loading State
```tsx
<SectionCard
  title="Test"
  isEditing={true}
  isLoading={true}
  onEdit={() => {}}
  onCancel={() => {}}
  onSave={() => {}}
>
  <div>Form</div>
</SectionCard>
// Shows: Spinner + "Đang lưu..." on Save button
```

### Disabled
```tsx
<SectionCard
  title="Test"
  isEditing={false}
  isDisabled={true}
  onEdit={() => {}}
  onCancel={() => {}}
>
  <div>Content</div>
</SectionCard>
// Shows: "Chỉnh sửa" button disabled (gray)
```

---

## 🎬 Animation & Transition

```css
/* View ↔ Edit mode transition */
div className="transition-all"

/* Content visibility */
div className="transition-all" (hidden/block)

/* Button hover effects */
hover:bg-blue-700  /* Edit button */
hover:bg-green-700 /* Save button */
hover:bg-gray-50   /* Cancel button */

/* Loading spinner */
animate-spin (Tailwind's continuous rotation)
```

---

## 📱 Mobile Responsive

### Desktop
```
┌────────────────────────────────────────────┐
│ Title           Description  [Button]      │
└────────────────────────────────────────────┘
```

### Mobile (small screen)
```
┌─────────────────────────┐
│ Title          [Button] │
│ Description            │
└─────────────────────────┘
```

**Responsive logic:**
- Header uses `flex items-center justify-between`
- Title area uses `flex-1` (grows to fill space)
- Buttons use `flex gap-2` (stack horizontally)
- Content area is full width

---

## ✨ Key Features

✅ **Conditional Rendering**
- Form only visible when `isEditing=true`
- Buttons change based on editing state

✅ **Loading Feedback**
- Spinner on Save button
- "Đang lưu..." text
- Buttons disabled during load

✅ **Disabled State**
- Edit button can be disabled
- All buttons disabled during loading
- Clear visual feedback with gray color

✅ **Accessibility**
- Semantic button elements
- Clear button labels
- Proper color contrast
- Cursor changes

✅ **Animation**
- Smooth transition on mode change
- Hover effects on buttons
- Loading spinner animation

---

## 🚀 Copy-Paste Ready

Just copy the code above and adjust:
1. `title` - section title
2. `description` - optional help text
3. Props passed from parent state
4. Child form component
5. Success message below (if needed)

**No additional setup required!**
