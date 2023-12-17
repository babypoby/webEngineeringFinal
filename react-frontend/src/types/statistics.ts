import { LatLngExpression } from "leaflet";

export interface PointLayer {
    name: string;
    coordinates: Point[];
}
export interface Point {
    coordinates: number[];
    properties: any;
}

export interface ParkingPoint extends Point {
    coordinates: number [];
    properties: any;
    count: number;
}

export interface GraphData {
    name: string;
    data: number;
}