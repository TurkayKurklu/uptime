export interface SiteWithLogs {
  id: string;
  url: string;
  name: string;
  isActive: boolean;
  checkInterval: number;
  lastStatus: string | null;
  lastCheckedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  logs: CheckLogData[];
}

export interface CheckLogData {
  id: string;
  siteId: string;
  statusCode: number | null;
  responseTime: number | null;
  dnsTime: number | null;
  connectTime: number | null;
  sslTime: number | null;
  isUp: boolean;
  errorMessage: string | null;
  errorCategory: string | null;
  screenshotUrl: string | null;
  checkedAt: Date;
}

export interface CheckResult {
  isUp: boolean;
  statusCode: number | null;
  responseTime: number;
  dnsTime?: number | null;
  connectTime?: number | null;
  sslTime?: number | null;
  errorMessage: string | null;
  errorCategory: string | null;
}

export interface SiteFormData {
  name: string;
  url: string;
}
