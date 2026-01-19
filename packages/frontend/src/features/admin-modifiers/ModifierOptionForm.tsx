import { useState } from 'react';
import { useForm } from 'react-hook-form';
import modifierApi from '../../services/modifierApi';
import type {
  CreateModifierOptionDto,
  UpdateModifierOptionDto,
  ModifierOption,
} from '../../services/modifierApi';

interface ModifierOptionFormProps {
  groupId: string;
  option?: ModifierOption;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ModifierOptionForm({
  groupId,
  option,
  onSuccess,
  onCancel,
}: ModifierOptionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateModifierOptionDto>({
    defaultValues: option
      ? {
        name: option.name,
        priceAdjustment: option.priceAdjustment,
        status: option.status,
      }
      : {
        priceAdjustment: 0,
        status: 'active',
      },
  });

  const onSubmit = async (data: CreateModifierOptionDto) => {
    setIsSubmitting(true);
    setError(null);

    try {
      if (option) {
        await modifierApi.updateOption(option.id, data as UpdateModifierOptionDto);
      } else {
        await modifierApi.addOptionToGroup(groupId, data);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save option');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4">
        {option ? 'Edit Option' : 'Add Option'}
      </h3>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Option Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register('name', { required: 'Name is required' })}
            className="w-full border rounded px-3 py-2"
            placeholder="e.g., Small, Large, Extra Cheese"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Price Adjustment */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Price Adjustment (VNĐ) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            {...register('priceAdjustment', {
              valueAsNumber: true,
              required: 'Price adjustment is required',
              min: { value: 0, message: 'Must be >= 0' },
            })}
            className="w-full border rounded px-3 py-2"
            placeholder="0.00"
          />
          {errors.priceAdjustment && (
            <p className="text-red-500 text-sm mt-1">
              {errors.priceAdjustment.message}
            </p>
          )}
          <p className="text-sm text-gray-500 mt-1">
            Amount to add to the base price (use 0 for no extra charge)
          </p>
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

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isSubmitting ? 'Saving...' : option ? 'Update' : 'Add'}
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
