export interface SkillMetadata {
  name: string;
  description: string;
  license?: string;
  compatibility?: string;
  metadata?: {
    author?: string;
    version?: string;
    [key: string]: any;
  };
}

export interface SkillValidation {
  isValid: boolean;
  errors: string[];
  metadata?: SkillMetadata;
}

export interface UploadResult {
  signature: string;
  skillName: string;
  size: number;
  encrypted: boolean;
}

export interface DownloadResult {
  skillName: string;
  data: Buffer;
  metadata: any;
}

export interface RegistryEntry {
  name: string;
  signature: string;
  uploadedAt: string;
  size: number;
  encrypted: boolean;
}

export interface IQConfig {
  rpcUrl: string;
  privateKey: string;
  encryptionKey?: string;
}
