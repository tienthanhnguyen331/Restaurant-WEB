import { useState } from 'react';
import { useForm } from 'react-hook-form';
import modifierApi from '../../services/modifierApi';
import type {
  CreateModifierGroupDto,
  UpdateModifierGroupDto,
  ModifierGroup,
} from '../../services/modifierApi';

interface ModifierGroupFormProps {
  group?: ModifierGroup;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ModifierGroupForm({
  group,
  onSuccess,
  onCancel,
}: ModifierGroupFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateModifierGroupDto>({
    defaultValues: group
      ? {
          name: group.name,
          selectionType: group.selectionType,
          isRequired: group.isRequired,
          minSelections: group.minSelections,
          maxSelections: group.maxSelections,
          displayOrder: group.displayOrder,
          status: group.status,
        }
      : {
          selectionType: 'single',
          isRequired: false,
          displayOrder: 0,
          status: 'active',
        },
  });

  const selectionType = watch('selectionType');
  const isRequired = watch('isRequired');

  const onSubmit = async (data: CreateModifierGroupDto) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Client-side validation for multiple
      if (data.selectionType === 'multiple') {
        if (
          data.minSelections !== undefined &&
          data.maxSelections !== undefined &&
          data.minSelections !== null &&
          data.maxSelections !== null &&
          data.minSelections > data.maxSelections
        ) {
          setError('Min selections không được lớn hơn Max selections');
          setIsSubmitting(false);
          return;
        }
      }

      // Clean data - remove undefined values
      const cleanData: any = {
        name: data.name,
        selectionType: data.selectionType,
        isRequired: data.isRequired || false,
        displayOrder: data.displayOrder || 0,
        status: data.status || 'active',
      };

      // Only add min/max if selectionType is multiple
      if (data.selectionType === 'multiple') {
        if (data.minSelections !== undefined && data.minSelections !== null) {
          cleanData.minSelections = data.minSelections;
        }
        if (data.maxSelections !== undefined && data.maxSelections !== null) {
          cleanData.maxSelections = data.maxSelections;
        }
        // Nếu required mà chưa set minSelections, mặc định =1
        if (data.isRequired && cleanData.minSelections === undefined) {
          cleanData.minSelections = 1;
        }
      }

      if (group) {
        await modifierApi.updateModifierGroup(group.id, cleanData as UpdateModifierGroupDto);
      } else {
        await modifierApi.createModifierGroup(cleanData);
      }
      onSuccess();
    } catch (err: any) {
      console.error('Error saving modifier group:', err);
      setError(err.response?.data?.message || err.message || 'Failed to save modifier group');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">
        {group ? 'Edit Modifier Group' : 'Create Modifier Group'}
      </h2>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Group Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register('name', { required: 'Name is required' })}
            className="w-full border rounded px-3 py-2"
            placeholder="e.g., Size, Toppings"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Selection Type */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Selection Type <span className="text-red-500">*</span>
          </label>
          <select
            {...register('selectionType', { required: 'Selection type is required' })}
            className="w-full border rounded px-3 py-2"
          >
            <option value="single">Single (radio button)</option>
            <option value="multiple">Multiple (checkboxes)</option>
          </select>
          {errors.selectionType && (
            <p className="text-red-500 text-sm mt-1">{errors.selectionType.message}</p>
          )}
        </div>

        {/* Is Required */}
        <div className="flex items-center">
          <input
            type="checkbox"
            {...register('isRequired')}
            className="mr-2 h-4 w-4"
            id="isRequired"
          />
          <label htmlFor="isRequired" className="text-sm font-medium">
            Required (customer must select)
          </label>
        </div>

        {/* Min/Max Selections (only for multiple) */}
        {selectionType === 'multiple' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Min Selections
              </label>
              <input
                type="number"
                {...register('minSelections', {
                  valueAsNumber: true,
                  min: { value: 0, message: 'Must be >= 0' },
                })}
                className="w-full border rounded px-3 py-2"
                placeholder="0"
              />
              {errors.minSelections && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.minSelections.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Max Selections
              </label>
              <input
                type="number"
                {...register('maxSelections', {
                  valueAsNumber: true,
                  min: { value: 1, message: 'Must be >= 1' },
                })}
                className="w-full border rounded px-3 py-2"
                placeholder="Unlimited"
              />
              {errors.maxSelections && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.maxSelections.message}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Display Order */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Display Order
          </label>
          <input
            type="number"
            {...register('displayOrder', {
              valueAsNumber: true,
              min: { value: 0, message: 'Must be >= 0' },
            })}
            className="w-full border rounded px-3 py-2"
            placeholder="0"
          />
          {errors.displayOrder && (
            <p className="text-red-500 text-sm mt-1">
              {errors.displayOrder.message}
            </p>
          )}
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            {...register('status')}
            className="w-full border rounded px-3 py-2"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Validation Note */}
        {isRequired && (
          <div className="bg-yellow-50 text-yellow-800 p-3 rounded text-sm">
            <strong>Note:</strong> Required groups must have at least 1 option.
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isSubmitting ? 'Saving...' : group ? 'Update' : 'Create'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
