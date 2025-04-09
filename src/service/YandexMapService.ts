import axios from "axios";
import { IZone } from "../const/zones";

interface YandexGeocodeResponse {
  response: {
    GeoObjectCollection: {
      featureMember: Array<{
        GeoObject: {
          name: string;
          Point: {
            pos: string; // "долгота широта" (например, "37.617644 55.755819")
          };
        };
      }>;
    };
  };
}


class YandexMapService {

  async getCoordinates(address: string): Promise<[number, number] | null> {
    try {
      const response = await axios.get<YandexGeocodeResponse>(
        `https://geocode-maps.yandex.ru/1.x/?apikey=${process.env.YANDEX_MAPS_API_KEY}&format=json&geocode=${encodeURIComponent(address)}`
      );
      
      const firstResult = response.data.response.GeoObjectCollection.featureMember[0]?.GeoObject;
      if (!firstResult) {
        throw new Error('Адрес не найден');
      }
      
      // Координаты в формате "долгота широта" (например, "37.617644 55.755819")
      const [lon, lat] = firstResult.Point.pos.split(' ').map(parseFloat);
      return [lat, lon]; // Возвращаем [широта, долгота]
    } 
    catch (error) {
      console.error('Ошибка при геокодировании:', error);
      return null;
    }
  }

  isPointInPolygon = (point: [number, number], polygon: IZone['coords']) => {
    const x = point[0];
    const y = point[1];
    let inside = false;
    
    for(let i = 0, j = polygon.length - 1; i < polygon.length; j = i++){
        const xi = polygon[i][0];
        const yi = polygon[i][1];
        const xj = polygon[j][0];
        const yj = polygon[j][1];
            
        const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

        if(intersect) inside = !inside;
    }
    
    return inside
  }
}


export const yandexMapService = new YandexMapService()