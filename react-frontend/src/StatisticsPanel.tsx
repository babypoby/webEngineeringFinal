import './StatisticsPanel.css';
import type { PointLayer} from './types/statistics';
import Barplot from "./Barplot";
import ParkingSpaceData from './ParkingSpaceData';
import type { ParkingPoint } from './types/statistics';
import TramstopsStats from './TramstopsStats';

const StatisticsPanel = ({ statistics }: { statistics: PointLayer[] }) => {
    
    const statisticsPanel = {
        flex: 0.25,
        overflowY: 'scroll' as 'scroll',
    }
    const nameMap = {
        "Trainstations": "Train Stations",
        "Parkingspaces": "Parking Spaces",
        "Tramstations": "Tram Stations"
    };

    return (
        <div className="w-full md:w-1/4 p-4 statistics-panel" style = {statisticsPanel}>
            <div className='text-center'>
            <h2 className='statistics-header'>Statistics</h2>
            <hr className="divider-line" /> {/* Horizontal line */}

            </div>
            {
                statistics.map((layer, index) => (
                    <div key={layer.name}>
                    <div key={index} className='text-center'>
                    <h3 className="plot-title"><strong>{nameMap[layer.name] || layer.name}</strong></h3>
                        {(layer.name === "Trainstations") ? <Barplot data={layer.coordinates}/> : 
                        (layer.name === "Parkingspaces") ? <ParkingSpaceData data={layer.coordinates as ParkingPoint[]}/> : 
                        (layer.name === "Tramstations") ? <TramstopsStats data={layer.coordinates}/> : <div></div>}
                    </div> <br></br>
                    </div>
                ))
            }
            
        </div>
    );
};

export default StatisticsPanel;
