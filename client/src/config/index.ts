/**
 * Environment configuration
 */
import { CodegenTypeEnum } from "@/utils/codegen-types";

// Deploy domain
export const DEPLOY_DOMAIN =
  process.env.PUBLIC_DEPLOY_DOMAIN || "http://localhost:8123/api/dist";

// API base URL
export const API_BASE_URL: string =
  process.env.PUBLIC_API_BASE_URL || "http://localhost:8123/api";

// Static resource URL
export const STATIC_BASE_URL = `${API_BASE_URL}/static`;

// Get deployed app URL
export const getDeployUrl = (deployKey: string) => {
  return `${DEPLOY_DOMAIN}/${deployKey}`;
};

// Get static preview URL
export const getStaticPreviewUrl = (codegenType: string, appId: string) => {
  const baseUrl = `${STATIC_BASE_URL}/${codegenType}_${appId}`;
  // If it's a Vue project, add dist suffix
  if (codegenType === CodegenTypeEnum.VUE_PROJECT) {
    return `${baseUrl}/dist`;
  }
  return baseUrl;
};
