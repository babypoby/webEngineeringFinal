import './StatisticsPanel.css';
import type { PointLayer} from './types/statistics';
import Barplot from "./Barplot";
import ParkingSpaceData from './ParkingSpaceData';
import type { ParkingPoint } from './types/statistics';


const StatisticsPanel = ({ statistics }: { statistics: PointLayer[] }) => {
    
    console.log(statistics)

    return (
        <div className="w-full md:w-1/4 p-4 bg-white">
            <div className='text-center'>
                <h2 className='text-lg font-semibold border-b-2 border-gray-300 py-2'>Statistics</h2>
            </div>
            {
                statistics.map((layer, index) => (
                    <div>
                    <div key={index} className='text-center'>
                        <h3 className="text-sm text-gray-600"><strong>{layer.name}</strong></h3>
                        {(layer.name === "Trainstations") ? <Barplot data={layer.coordinates}/> : 
                        (layer.name == "Parkingspaces") ? <ParkingSpaceData data={layer.coordinates as ParkingPoint[]}/> : <p></p>}  
                    </div> <br></br>
                    </div>
                ))
            }
            
        </div>
    );
};

export default StatisticsPanel;
