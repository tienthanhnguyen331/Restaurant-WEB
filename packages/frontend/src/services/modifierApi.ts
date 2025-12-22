import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface ModifierGroup {
  id: string;
  restaurantId: string;
  name: string;
  selectionType: 'single' | 'multiple';
  isRequired: boolean;
  minSelections?: number;
  maxSelections?: number;
  displayOrder: number;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export interface ModifierOption {
  id: string;
  groupId: string;
  name: string;
  priceAdjustment: number;
  status: 'active' | 'inactive';
  createdAt: Date;
}

export interface ModifierGroupWithOptions extends ModifierGroup {
  options: ModifierOption[];
}

export interface CreateModifierGroupDto {
  name: string;
  selectionType: 'single' | 'multiple';
  isRequired: boolean;
  minSelections?: number;
  maxSelections?: number;
  displayOrder?: number;
  status?: 'active' | 'inactive';
}

export interface UpdateModifierGroupDto {
  name?: string;
  selectionType?: 'single' | 'multiple';
  isRequired?: boolean;
  minSelections?: number;
  maxSelections?: number;
  displayOrder?: number;
  status?: 'active' | 'inactive';
}

export interface CreateModifierOptionDto {
  name: string;
  priceAdjustment: number;
  status?: 'active' | 'inactive';
}

export interface UpdateModifierOptionDto {
  name?: string;
  priceAdjustment?: number;
  status?: 'active' | 'inactive';
}

export interface AttachModifierGroupsDto {
  modifierGroupIds: string[];
}

const modifierApi = {
  // Modifier Groups
  async getModifierGroups(): Promise<ModifierGroupWithOptions[]> {
    const response = await axios.get(`${API_BASE_URL}/api/admin/menu/modifier-groups`);
    return response.data;
  },

  async createModifierGroup(data: CreateModifierGroupDto): Promise<ModifierGroup> {
    const response = await axios.post(`${API_BASE_URL}/api/admin/menu/modifier-groups`, data);
    return response.data;
  },

  async updateModifierGroup(id: string, data: UpdateModifierGroupDto): Promise<ModifierGroup> {
    const response = await axios.put(`${API_BASE_URL}/api/admin/menu/modifier-groups/${id}`, data);
    return response.data;
  },

  async deleteModifierGroup(id: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/api/admin/menu/modifier-groups/${id}`);
  },

  // Modifier Options
  async addOptionToGroup(groupId: string, data: CreateModifierOptionDto): Promise<ModifierOption> {
    const response = await axios.post(
      `${API_BASE_URL}/api/admin/menu/modifier-groups/${groupId}/options`,
      data
    );
    return response.data;
  },

  async updateOption(optionId: string, data: UpdateModifierOptionDto): Promise<ModifierOption> {
    const response = await axios.put(
      `${API_BASE_URL}/api/admin/menu/modifier-options/${optionId}`,
      data
    );
    return response.data;
  },

  async deleteOption(optionId: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/api/admin/menu/modifier-options/${optionId}`);
  },

  // Attach/Detach Groups to Items
  async attachGroupsToItem(itemId: string, data: AttachModifierGroupsDto): Promise<void> {
    await axios.post(
      `${API_BASE_URL}/api/admin/menu/items/${itemId}/modifier-groups`,
      data
    );
  },

  async detachGroupFromItem(itemId: string, groupId: string): Promise<void> {
    await axios.delete(
      `${API_BASE_URL}/api/admin/menu/items/${itemId}/modifier-groups/${groupId}`
    );
  },

  // Get groups for a specific item
  async getItemModifierGroups(itemId: string): Promise<ModifierGroupWithOptions[]> {
    const response = await axios.get(
      `${API_BASE_URL}/api/admin/menu/items/${itemId}/modifier-groups`
    );
    return response.data;
  },
};

export default modifierApi;
