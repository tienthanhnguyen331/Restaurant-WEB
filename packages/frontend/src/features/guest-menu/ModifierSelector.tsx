import { formatCurrency } from '../../utils/formatCurrency';
interface ModifierOption {
  id: string;
  name: string;
  priceAdjustment: number;
}

interface ModifierGroup {
  id: string;
  name: string;
  selectionType: 'single' | 'multiple';
  isRequired: boolean;
  minSelections?: number;
  maxSelections?: number;
  options: ModifierOption[];
}

interface ModifierSelectorProps {
  modifierGroups: ModifierGroup[];
  selectedModifiers: Record<string, string[]>;
  onModifierChange: (modifiers: Record<string, string[]>) => void;
}

export default function ModifierSelector({
  modifierGroups,
  selectedModifiers,
  onModifierChange,
}: ModifierSelectorProps) {
  const handleSingleSelection = (groupId: string, optionId: string) => {
    onModifierChange({
      ...selectedModifiers,
      [groupId]: [optionId],
    });
  };

  const handleMultipleSelection = (groupId: string, optionId: string, group: ModifierGroup) => {
    const currentSelections = selectedModifiers[groupId] || [];
    let newSelections: string[];

    if (currentSelections.includes(optionId)) {
      // Deselect
      newSelections = currentSelections.filter(id => id !== optionId);
    } else {
      // Select (check max limit)
      if (group.maxSelections && currentSelections.length >= group.maxSelections) {
        alert(`Maximum ${group.maxSelections} selections allowed for ${group.name}`);
        return;
      }
      newSelections = [...currentSelections, optionId];
    }

    onModifierChange({
      ...selectedModifiers,
      [groupId]: newSelections,
    });
  };

  const isValidSelection = (group: ModifierGroup): boolean => {
    const selections = selectedModifiers[group.id] || [];

    if (group.isRequired && selections.length === 0) {
      return false;
    }

    if (group.minSelections && selections.length < group.minSelections) {
      return false;
    }

    return true;
  };

  return (
    <div className="space-y-4">
      {modifierGroups.map((group) => {
        const selections = selectedModifiers[group.id] || [];
        const valid = isValidSelection(group);

        return (
          <div key={group.id} className="border-b pb-4 last:border-b-0">
            <div className="mb-2">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-900">
                  {group.name}
                  {group.isRequired && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </h4>
                {!valid && (
                  <span className="text-xs text-red-500">Required</span>
                )}
              </div>

              {/* Selection Info */}
              <p className="text-xs text-gray-500 mt-1">
                {group.selectionType === 'single'
                  ? 'Select one option'
                  : `Select ${group.minSelections || 0}${group.maxSelections ? `-${group.maxSelections}` : '+'
                  } options`}
              </p>
            </div>

            <div className="space-y-2">
              {group.options.map((option) => {
                const isSelected = selections.includes(option.id);

                return (
                  <label
                    key={option.id}
                    className={`flex items-start p-2 rounded cursor-pointer transition-colors ${isSelected
                      ? 'bg-blue-50 border-blue-300 border'
                      : 'bg-gray-50 border border-transparent hover:bg-gray-100'
                      }`}
                  >
                    <div className="flex items-center h-5">
                      <input
                        type={group.selectionType === 'single' ? 'radio' : 'checkbox'}
                        name={group.id}
                        checked={isSelected}
                        onChange={() => {
                          if (group.selectionType === 'single') {
                            handleSingleSelection(group.id, option.id);
                          } else {
                            handleMultipleSelection(group.id, option.id, group);
                          }
                        }}
                        className="mr-3 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <span className="text-sm font-medium text-gray-900 break-words pr-2">
                        {option.name}
                      </span>
                      {option.priceAdjustment > 0 && (
                        <span className="text-xs text-green-600 font-bold whitespace-nowrap mt-0.5">
                          +{formatCurrency(option.priceAdjustment)}
                        </span>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
