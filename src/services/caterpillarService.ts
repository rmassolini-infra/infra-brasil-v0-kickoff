import { supabase } from "@/integrations/supabase/client";

export interface FleetSnapshot {
  fleet?: {
    equipment?: Array<{
      header?: {
        equipmentID?: string;
        make?: string;
        model?: string;
        serialNumber?: string;
      };
      location?: {
        latitude?: number;
        longitude?: number;
        altitude?: number;
      };
      cumulativeOperatingHours?: {
        hour?: number;
      };
      fuelRemaining?: {
        percent?: number;
      };
      engineStatus?: {
        speed?: number;
      };
    }>;
  };
}

export interface FaultData {
  faultCodeMessages?: {
    faultCodeMessage?: Array<{
      faultCode?: {
        fmi?: string;
        occurrence?: string;
        spn?: string;
      };
      dateTime?: string;
    }>;
  };
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

  async getFleetSnapshot(pageNumber: number = 1): Promise<FleetSnapshot> {
    return this.callEdgeFunction('fleet', pageNumber.toString());
  }

  async getEquipmentSnapshot(make: string, model: string, serialNumber: string) {
    const endpoint = `/fleet/equipment/makeModelSerial/${make}/${model}/${serialNumber}`;
    return this.callEdgeFunction('equipment', endpoint);
  }

  async getFaults(
    make: string, 
    model: string, 
    serialNumber: string, 
    startDateUTC: string, 
    endDateUTC: string, 
    pageNumber: number = 1
  ): Promise<FaultData> {
    const endpoint = `/fleet/equipment/makeModelSerial/${make}/${model}/${serialNumber}/faults/${startDateUTC}/${endDateUTC}/${pageNumber}`;
    return this.callEdgeFunction('faults', endpoint);
  }

  async getLocations(
    make: string, 
    model: string, 
    serialNumber: string, 
    startDateUTC: string, 
    endDateUTC: string, 
    pageNumber: number = 1
  ) {
    const endpoint = `/fleet/equipment/makeModelSerial/${make}/${model}/${serialNumber}/locations/${startDateUTC}/${endDateUTC}/${pageNumber}`;
    return this.callEdgeFunction('locations', endpoint);
  }
}

export const caterpillarService = new CaterpillarService();
