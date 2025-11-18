export interface Role {
  id: string;
  name: string;
  sku: string;
  displayName: string;
  description?: string;
  type: string;
  tenantVisibility: string;
  ownerId: string;
  ownerType: string;
  permissionBoundaryId?: string;
  tenantVisibilityInclusionList: string[];
  metadata: Record<string, any>;
}