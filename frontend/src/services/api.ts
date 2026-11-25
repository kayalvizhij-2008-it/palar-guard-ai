import {
  LocationData,
  GroundwaterPoint,
  WaterQualityPoint,
  AnomalyAlertItem,
  InvestigationItem,
  CommunityReportItem,
  RechargeItem,
  User,
} from '../types';
import {
  PALAR_LOCATIONS,
  GROUNDWATER_TIMESERIES,
  WATER_QUALITY_STATIONS,
  ANOMALIES_DATA,
  COMMUNITY_REPORTS_DATA,
  RECHARGE_ASSESSMENTS_DATA,
  RAINFALL_SERIES,
  getCentralAnalyticsSummary,
  getCentralMapOverview,
  getCentralStationDetail,
  getCentralAssistantResponse,
} from '../data/palarData';

const envBase = ((import.meta as any).env?.VITE_API_BASE_URL || '').trim();
const isProd = Boolean((import.meta as any).env?.PROD);
export const API_ROOT = envBase
  ? envBase.startsWith('http')
    ? envBase.replace(/\/$/, '')
    : `https://${envBase.replace(/\/$/, '')}`
  : isProd
  ? ''
  : 'http://127.0.0.1:8000';
export const API_BASE_URL = API_ROOT ? `${API_ROOT}/api/v1` : '/api/v1';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status = 0) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

function getAuthHeader(): Record<string, string> {
  try {
    const token = localStorage.getItem('palar_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

async function requestJson<T>(url: string, options?: RequestInit, timeoutMs = 8000): Promise<T> {
  if (isProd && !API_ROOT) {
    throw new ApiError('Live backend service is not connected in this deployment.', 0);
  }
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  const isFormData = typeof FormData !== 'undefined' && options?.body instanceof FormData;

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...getAuthHeader(),
        ...(options?.headers || {}),
      },
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      let detail = `Request failed (${res.status})`;
      try {
        const errBody = await res.json();
        detail = errBody.detail || errBody.message || detail;
      } catch {
        // ignore non-json error body
      }
      throw new ApiError(detail, res.status);
    }

    return (await res.json()) as T;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err instanceof ApiError) throw err;
    if (err?.name === 'AbortError') {
      throw new ApiError('Backend request timed out. Please retry.', 408);
    }
    throw new ApiError('Unable to reach backend service. Please try again later.', 0);
  }
}

async function withReadFallback<T>(fetcher: () => Promise<T>, fallback: () => T): Promise<T> {
  if (isProd && !API_ROOT) {
    return fallback();
  }
  try {
    return await fetcher();
  } catch (err: any) {
    if (err instanceof ApiError && (err.status === 0 || err.status === 408 || err.status >= 500)) {
      return fallback();
    }
    throw err;
  }
}

export interface DocumentItem {
  id: number;
  owner_id: number;
  filename: string;
  file_type: string;
  file_size_bytes: number;
  sha256_hash: string;
  page_count: number;
  extraction_status: 'extracted' | 'partial' | 'failed' | 'ocr_unavailable';
  extraction_notes: string;
  extracted_text: string;
  tables: { name: string; headers: string[]; rows: string[][] }[];
  created_at: string;
}

export interface DocumentAnalysisItem {
  id: number;
  document_id: number;
  compared_document_id?: number | null;
  task_type: string;
  instruction: string;
  language: string;
  provider_mode: string;
  result_markdown: string;
  observations: string[];
  interpretations: string[];
  missing_information: string[];
  citations: string[];
  created_at: string;
}

export interface WatchlistEntry {
  id: number;
  location_id: number;
  location_name: string;
  district: string;
  basin_zone: string;
  risk_score: number;
  alert_threshold_mbgl: number;
  alert_threshold_tds: number;
  notes: string;
  latest_mbgl: number | null;
  latest_tds: number | null;
  latest_chromium: number | null;
  open_alerts: number;
  threshold_exceeded: boolean;
  created_at: string;
}

export const apiService = {
  async checkHealth(): Promise<{ status: string; database?: string; environment?: string } | null> {
    try {
      return await requestJson(`${API_ROOT}/health`, { method: 'GET' }, 4000);
    } catch {
      return null;
    }
  },

  // Auth
  async login(email: string, password: string): Promise<{ access_token: string; token_type: string; user: User }> {
    const data = await requestJson<{ access_token: string; token_type: string; user: User }>(
      `${API_BASE_URL}/auth/login`,
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    );
    localStorage.setItem('palar_token', data.access_token);
    localStorage.setItem('palar_user', JSON.stringify(data.user));
    return data;
  },

  async register(
    full_name: string,
    email: string,
    password: string,
    role: 'Community Reporter' | 'Viewer' = 'Community Reporter'
  ): Promise<User> {
    return requestJson<User>(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      body: JSON.stringify({ full_name, email, password, role }),
    });
  },

  async getMe(): Promise<User> {
    return requestJson<User>(`${API_BASE_URL}/auth/me`);
  },

  async updateUserRole(userId: number, role: string, isActive?: boolean): Promise<User> {
    return requestJson<User>(`${API_BASE_URL}/auth/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role, is_active: isActive }),
    });
  },

  // Analytics Summary
  async getAnalyticsSummary(): Promise<any> {
    return withReadFallback(
      () => requestJson(`${API_BASE_URL}/analytics/summary`),
      () => getCentralAnalyticsSummary()
    );
  },

  // Locations
  async getLocations(): Promise<LocationData[]> {
    return withReadFallback(
      () => requestJson<LocationData[]>(`${API_BASE_URL}/locations/`),
      () => PALAR_LOCATIONS
    );
  },

  async getLocationRiskBreakdown(locationId: number): Promise<any> {
    return withReadFallback(
      () => requestJson(`${API_BASE_URL}/locations/${locationId}/risk-breakdown`),
      () => {
        const loc = PALAR_LOCATIONS.find((l) => l.id === locationId) || PALAR_LOCATIONS[0];
        return {
          location_id: loc.id,
          name: loc.name,
          risk_score: loc.risk_score,
          confidence_level: loc.confidence_level,
        };
      }
    );
  },

  // Groundwater & Forecast
  async getGroundwaterRecords(locationId = 1): Promise<GroundwaterPoint[]> {
    return withReadFallback(
      async () => {
        const rows = await requestJson<any[]>(`${API_BASE_URL}/groundwater/?location_id=${locationId}`);
        return rows.map((r) => ({
          period: r.observation_date,
          depth_mbgl: r.water_level_mbgl,
          trend: r.trend_rate,
          source: r.data_source,
          provenance: r.provenance,
        }));
      },
      () => GROUNDWATER_TIMESERIES[locationId] || GROUNDWATER_TIMESERIES[1]
    );
  },

  async getGroundwaterForecast(locationId = 1): Promise<any> {
    return withReadFallback(
      () => requestJson(`${API_BASE_URL}/groundwater/forecast?location_id=${locationId}`),
      () => ({
        location_id: locationId,
        series: GROUNDWATER_TIMESERIES[locationId] || GROUNDWATER_TIMESERIES[1],
      })
    );
  },

  // Water Quality
  async getWaterQuality(): Promise<WaterQualityPoint[]> {
    return withReadFallback<WaterQualityPoint[]>(
      async () => {
        const [records, locs] = await Promise.all([
          requestJson<any[]>(`${API_BASE_URL}/water-quality/`),
          requestJson<LocationData[]>(`${API_BASE_URL}/locations/`),
        ]);
        return records.map((r) => {
          const loc = locs.find((l) => l.id === r.location_id);
          const status: WaterQualityPoint['status'] =
            r.chromium_mg_l > 0.05 || r.tds_mg_l > 1500
              ? 'Critical'
              : r.bod_mg_l > 3.0 || r.tds_mg_l > 1000
              ? 'Elevated'
              : 'Normal';
          return {
            location_id: r.location_id,
            location_name: loc?.name || `Station #${r.location_id}`,
            ph: r.ph,
            tds_mg_l: r.tds_mg_l,
            ec_us_cm: r.ec_us_cm,
            chromium_mg_l: r.chromium_mg_l,
            bod_mg_l: r.bod_mg_l,
            do_mg_l: r.do_mg_l,
            status,
            sample_context: 'River Surface Water' as WaterQualityPoint['sample_context'],
            standards_comparison: {
              bis_drinking_status: r.chromium_mg_l > 0.05 ? 'Exceeds BIS 0.05 mg/L Cr' : 'Within BIS Limits',
              cpcb_class_c_status: r.do_mg_l < 5.0 ? 'Below CPCB 5.0 mg/L DO' : 'Compliant',
            },
            provenance: r.provenance,
            citation: r.data_source,
          };
        });
      },
      () => WATER_QUALITY_STATIONS
    );
  },

  // Rainfall
  async getRainfall(locationId = 1): Promise<any[]> {
    return withReadFallback(
      () => requestJson<any[]>(`${API_BASE_URL}/rainfall/?location_id=${locationId}`),
      () => RAINFALL_SERIES
    );
  },

  // Anomalies
  async getAnomalies(): Promise<AnomalyAlertItem[]> {
    return withReadFallback(
      async () => {
        const [alerts, locs] = await Promise.all([
          requestJson<any[]>(`${API_BASE_URL}/anomalies/`),
          requestJson<LocationData[]>(`${API_BASE_URL}/locations/`),
        ]);
        return alerts.map((a) => ({
          ...a,
          location_name: locs.find((l) => l.id === a.location_id)?.name || `Station #${a.location_id}`,
          mad_deviation: 0,
          detection_method: 'Robust Z-score / Seasonal IQR',
        }));
      },
      () => ANOMALIES_DATA
    );
  },

  async updateAnomalyStatus(alertId: number, newStatus: string): Promise<any> {
    return requestJson(`${API_BASE_URL}/anomalies/${alertId}/status?new_status=${encodeURIComponent(newStatus)}`, {
      method: 'PATCH',
    });
  },

  // Investigations (RBAC Protected)
  async getInvestigations(): Promise<InvestigationItem[]> {
    const [items, locs] = await Promise.all([
      requestJson<any[]>(`${API_BASE_URL}/investigations/`),
      requestJson<LocationData[]>(`${API_BASE_URL}/locations/`),
    ]);
    return items.map((inv) => ({
      id: inv.id,
      location_id: inv.location_id,
      location_name: locs.find((l) => l.id === inv.location_id)?.name || `Station #${inv.location_id}`,
      title: inv.title,
      priority: inv.priority,
      status: inv.status,
      assigned_to: inv.assigned_to,
      findings: inv.findings || '',
      checklist: (inv.verification_checklist || '')
        .split(';')
        .map((s: string) => s.trim())
        .filter(Boolean),
      created_at: inv.created_at,
    }));
  },

  async createInvestigation(payload: {
    location_id: number;
    title: string;
    priority: string;
    assigned_to: string;
    findings?: string;
  }): Promise<any> {
    return requestJson(`${API_BASE_URL}/investigations/`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateInvestigation(
    invId: number,
    payload: { status?: string; findings?: string; verification_checklist?: string }
  ): Promise<any> {
    return requestJson(`${API_BASE_URL}/investigations/${invId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  // Community Reports
  async getCommunityReports(): Promise<CommunityReportItem[]> {
    return withReadFallback(
      async () => {
        const [reports, locs] = await Promise.all([
          requestJson<any[]>(`${API_BASE_URL}/community/reports`),
          requestJson<LocationData[]>(`${API_BASE_URL}/locations/`),
        ]);
        return reports.map((r) => ({
          ...r,
          location_name: locs.find((l) => l.id === r.location_id)?.name || 'Palar Basin',
        }));
      },
      () => COMMUNITY_REPORTS_DATA
    );
  },

  async getMyCommunityReports(): Promise<CommunityReportItem[]> {
    return withReadFallback(
      async () => {
        const [reports, locs] = await Promise.all([
          requestJson<any[]>(`${API_BASE_URL}/community/my-reports`),
          requestJson<LocationData[]>(`${API_BASE_URL}/locations/`),
        ]);
        return reports.map((r) => ({
          ...r,
          location_name: locs.find((l) => l.id === r.location_id)?.name || 'Palar Basin',
        }));
      },
      () => COMMUNITY_REPORTS_DATA
    );
  },

  async submitCommunityReport(report: {
    reporter_name: string;
    reporter_contact?: string;
    location_id: number;
    category: string;
    description: string;
    latitude?: number;
    longitude?: number;
  }): Promise<CommunityReportItem> {
    return requestJson<CommunityReportItem>(`${API_BASE_URL}/community/reports`, {
      method: 'POST',
      body: JSON.stringify(report),
    });
  },

  async moderateCommunityReport(reportId: number, newStatus: string): Promise<any> {
    return requestJson(
      `${API_BASE_URL}/community/reports/${reportId}/status?new_status=${encodeURIComponent(newStatus)}`,
      { method: 'PATCH' }
    );
  },

  // Recharge
  async getRechargeAssessments(): Promise<RechargeItem[]> {
    return withReadFallback(
      async () => {
        const rows = await requestJson<any[]>(`${API_BASE_URL}/recharge/`);
        return rows.map((r) => ({
          id: r.id,
          location_name: r.location_name,
          soil: r.soil_permeability,
          slope: r.slope_gradient_pct,
          head_m: r.aquifer_storage_head_m,
          score: r.recharge_suitability_score,
          recommended: r.recommended_intervention,
          status: r.status,
          hydrological_context: r.methodology,
        }));
      },
      () => RECHARGE_ASSESSMENTS_DATA
    );
  },

  // AI Assistant
  async queryAssistant(query: string): Promise<{
    answer: string;
    sources: string[];
    confidence: string;
    provenance: string;
    limitations: string;
  }> {
    return withReadFallback(
      () =>
        requestJson(`${API_BASE_URL}/assistant/query`, {
          method: 'POST',
          body: JSON.stringify({ query }),
        }),
      () => getCentralAssistantResponse(query)
    );
  },

  // Maps
  async getMapOverview(): Promise<any> {
    return withReadFallback(
      () => requestJson(`${API_BASE_URL}/maps/overview`),
      () => getCentralMapOverview()
    );
  },

  async getMapStationDetail(stationId: number): Promise<any> {
    return withReadFallback(
      () => requestJson(`${API_BASE_URL}/maps/stations/${stationId}`),
      () => getCentralStationDetail(stationId)
    );
  },

  // Document Intelligence
  async uploadDocument(file: File): Promise<DocumentItem> {
    const form = new FormData();
    form.append('file', file);
    return requestJson<DocumentItem>(`${API_BASE_URL}/documents/upload`, {
      method: 'POST',
      body: form,
    }, 15000);
  },

  async listDocuments(): Promise<DocumentItem[]> {
    return requestJson<DocumentItem[]>(`${API_BASE_URL}/documents/`);
  },

  async getDocument(docId: number): Promise<DocumentItem> {
    return requestJson<DocumentItem>(`${API_BASE_URL}/documents/${docId}`);
  },

  async analyzeDocument(
    docId: number,
    payload: { task_type: string; instruction: string; language: string; compare_document_id?: number | null }
  ): Promise<DocumentAnalysisItem> {
    return requestJson<DocumentAnalysisItem>(`${API_BASE_URL}/documents/${docId}/analyze`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }, 15000);
  },

  async getDocumentAnalyses(docId: number): Promise<DocumentAnalysisItem[]> {
    return requestJson<DocumentAnalysisItem[]>(`${API_BASE_URL}/documents/${docId}/analyses`);
  },

  async exportDocumentText(docId: number, format: 'md' | 'json' | 'txt'): Promise<string> {
    const res = await fetch(`${API_BASE_URL}/documents/${docId}/export?format=${format}`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new ApiError(`Export failed (${res.status})`, res.status);
    return await res.text();
  },

  async deleteDocument(docId: number): Promise<void> {
    await requestJson(`${API_BASE_URL}/documents/${docId}`, { method: 'DELETE' });
  },

  // Monitoring Watchlist
  async getWatchlist(): Promise<WatchlistEntry[]> {
    return requestJson<WatchlistEntry[]>(`${API_BASE_URL}/monitoring/watchlist`);
  },

  async addWatchlistItem(payload: {
    location_id: number;
    alert_threshold_mbgl: number;
    alert_threshold_tds: number;
    notes?: string;
  }): Promise<any> {
    return requestJson(`${API_BASE_URL}/monitoring/watchlist`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async removeWatchlistItem(itemId: number): Promise<void> {
    await requestJson(`${API_BASE_URL}/monitoring/watchlist/${itemId}`, { method: 'DELETE' });
  },

  // Admin
  async getAdminUsers(): Promise<any[]> {
    return requestJson(`${API_BASE_URL}/admin/users`);
  },

  async getAdminAuditLogs(): Promise<any[]> {
    return requestJson(`${API_BASE_URL}/admin/audit-logs`);
  },

  async getAdminSystemStatus(): Promise<any> {
    return requestJson(`${API_BASE_URL}/admin/system-status`);
  },
};
