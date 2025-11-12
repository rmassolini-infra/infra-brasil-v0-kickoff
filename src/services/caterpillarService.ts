import { supabase } from "@/integrations/supabase/client";

export interface NormalizedAsset {
  oem: string;
  oem_asset_id: string;
  name?: string;
  make: string;
  model?: string;
  serial?: string;
  subscription?: string;
  status?: string;
}

export interface NormalizedLocation {
  asset_ref: string;
  ts: string;
  lat?: number;
  lon?: number;
  speed?: number;
  heading?: number;
  source: string;
}

export interface NormalizedHours {
  asset_ref: string;
  ts: string;
  hour_meter?: number;
  source: string;
}

export interface NormalizedFault {
  asset_ref: string;
  ts: string;
  code?: string;
  severity?: string;
  description?: string;
  source: string;
}

export interface NormalizedFuel {
  asset_ref: string;
  ts: string;
  fuel_used?: number;
  fuel_level?: number;
  source: string;
}

export interface FleetSnapshot {
  assets: NormalizedAsset[];
}


class CaterpillarService {
  private async callEdgeFunction(method: string, endpoint?: string) {
    try {
      const { data, error } = await supabase.functions.invoke('caterpillar-api', {
        body: { method, endpoint }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error calling Caterpillar API:', error);
      throw error;
    }
  }

  // High-level methods matching Python client
  async assets(pageNumber: number = 1): Promise<FleetSnapshot> {
    const response = await this.callEdgeFunction('assets', pageNumber.toString());
    return response as FleetSnapshot;
  }

  async locationsSince(
    make: string,
    model: string,
    serialNumber: string,
    sinceISO: string,
    pageNumber: number = 1
  ): Promise<NormalizedLocation[]> {
    const endpoint = `/fleet/equipment/makeModelSerial/${make}/${model}/${serialNumber}/locations/${sinceISO}/${new Date().toISOString()}/${pageNumber}`;
    return this.callEdgeFunction('locations', endpoint) as Promise<NormalizedLocation[]>;
  }

  async hoursSince(
    make: string,
    model: string,
    serialNumber: string,
    sinceISO: string,
    pageNumber: number = 1
  ): Promise<NormalizedHours[]> {
    const endpoint = `/fleet/equipment/makeModelSerial/${make}/${model}/${serialNumber}/hours/${sinceISO}/${new Date().toISOString()}/${pageNumber}`;
    return this.callEdgeFunction('hours', endpoint) as Promise<NormalizedHours[]>;
  }

  async faultsSince(
    make: string,
    model: string,
    serialNumber: string,
    sinceISO: string,
    pageNumber: number = 1
  ): Promise<NormalizedFault[]> {
    const endpoint = `/fleet/equipment/makeModelSerial/${make}/${model}/${serialNumber}/faults/${sinceISO}/${new Date().toISOString()}/${pageNumber}`;
    return this.callEdgeFunction('faults', endpoint) as Promise<NormalizedFault[]>;
  }

  async fuelSince(
    make: string,
    model: string,
    serialNumber: string,
    sinceISO: string,
    pageNumber: number = 1
  ): Promise<NormalizedFuel[]> {
    const endpoint = `/fleet/equipment/makeModelSerial/${make}/${model}/${serialNumber}/fuel/${sinceISO}/${new Date().toISOString()}/${pageNumber}`;
    return this.callEdgeFunction('fuel', endpoint) as Promise<NormalizedFuel[]>;
  }

  // Legacy methods for backward compatibility
  async getFleetSnapshot(pageNumber: number = 1): Promise<FleetSnapshot> {
    return this.assets(pageNumber);
  }

  async getEquipmentSnapshot(make: string, model: string, serialNumber: string) {
    const endpoint = `/fleet/equipment/makeModelSerial/${make}/${model}/${serialNumber}`;
    return this.callEdgeFunction('equipment', endpoint);
  }
}

export const caterpillarService = new CaterpillarService();
