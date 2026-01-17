import { IsOptional, IsNumber, Min, Max, IsString } from 'class-validator';

/**
 * Guest menu item structure (same as in guest-menu.service)
 */
export interface GuestMenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  prepTimeMinutes?: number;
  status: string;
  isChefRecommended: boolean;
  primaryPhotoUrl?: string | null;
  modifierGroups?: Array<{
    id: string;
    name: string;
    selectionType: string;
    isRequired: boolean;
    minSelections?: number;
    maxSelections?: number;
    displayOrder?: number;
    options: Array<{
      id: string;
      name: string;
      priceAdjustment: number;
      status: string;
    }>;
  }>;
}

/**
 * DTO for fuzzy search configuration in query params
 */
export class FuzzySearchQueryDto {
  @IsString()
  q: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  maxEditDistance?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  minScoreThreshold?: number;

  @IsOptional()
  categoryId?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;
}

/**
 * DTO for fuzzy search result item
 */
export class FuzzySearchItemDto {
  item: GuestMenuItem;

  /** Relevance score from 0 to 1 (higher = better match) */
  score: number;

  /** Type of match: exact, fuzzy, or partial */
  matchType: 'exact' | 'fuzzy' | 'partial';

  /** Fields that matched the query */
  matchedFields: string[];

  /** Suggested correction if likely misspelling */
  suggestion?: string;
}

/**
 * DTO for fuzzy search response
 */
export class FuzzySearchResponseDto {
  /** Matched items with scores */
  items: FuzzySearchItemDto[];

  /** Total number of matches */
  total: number;

  /** Current page number */
  page: number;

  /** Items per page */
  limit: number;

  /** Recommended correction (if no exact matches found) */
  didYouMean?: string;
}
