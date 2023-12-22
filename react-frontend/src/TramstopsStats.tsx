import React, {useState} from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, TooltipProps, BarChart, Bar, XAxis, YAxis, LabelList} from "recharts";
import IconButton from '@material-ui/core/IconButton';
import InfoIcon from '@material-ui/icons/Info';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';

const levelCountNameMapping = {
    0: "Accessible without help",
    1: "Accessible with help",
    2: "Not accessible",
};

const computeLevelCounts = (dataArray) => {
    const levelCounts = {
        0: 0,
        1: 0,
        2: 0,
    };

    dataArray.forEach(record => {
        levelCounts[record.properties.wheelchair_boarding]++;
    });

    return Object.keys(levelCounts).map(p => ({
        name: levelCountNameMapping[p],
        count: levelCounts[p]
    }));
}

const TramstopsStats = ({ data }) => {
  const [openDialog, setOpenDialog] = useState(false);

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

    const COLORS = ['#04c464', '#fce37c', '#ff3131'];

    const chartData = computeLevelCounts(data);

    const plotContainerStyle = {
        backgroundColor: '#f5f5f5',
        borderRadius: '10px',
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
        padding: '10px',
        border: '2px solid #009b4d'
    };

    // Function to calculate the accessibility ratio for tram lines
  const calculateAccessibility = (dataArray) => {
    const tramLineAccessibility = {};

    dataArray.forEach(record => {
      const lines = record.properties.tram_line.split(',');
      lines.forEach(line => {
        if (!tramLineAccessibility[line]) {
          tramLineAccessibility[line] = { accessible: 0, total: 0 };
        }
        tramLineAccessibility[line].total++;
        if (record.properties.wheelchair_boarding === 0) {
          tramLineAccessibility[line].accessible+= 2;
        } else if (record.properties.wheelchair_boarding === 1) {
          tramLineAccessibility[line].accessible++;
        }
      });
    });

    // Convert to an array, calculate the ratio, and sort by the ratio
    return Object.keys(tramLineAccessibility).map(line => ({
      name: line,
      accessible: tramLineAccessibility[line].accessible,
      total: tramLineAccessibility[line].total,
      ratio: tramLineAccessibility[line].accessible / tramLineAccessibility[line].total
    })).sort((a, b) => b.ratio - a.ratio || b.accessible - a.accessible); // Sort by ratio then by count
  };

  // Compute the tram line accessibility from data
  const tramLineAccessibility = calculateAccessibility(data).slice(0, 5);

    const CustomTooltip = ({ active, payload }: TooltipProps<any, any>) => {
      if (active && payload && payload.length) {
        return (
          <div className="custom-tooltip" style={{
            backgroundColor: '#fff',
            padding: '5px',
            border: '1px solid #ccc',
            boxShadow: '0px 0px 5px 0px rgba(0,0,0,0.3)',
            borderRadius: '5px'
          }}>
            <h4>{payload[0].name}</h4>
            <p className="label" style={{ marginBottom: '5px', fontSize: '14px', color: '#666' }}>
              {payload[0].value}
            </p>
          </div>
        );
      }
    
      return null;
    };

    return (
        <div style={plotContainerStyle}>
            <h4 className="barplot-title">Total number of stations: {data.length}</h4>
            <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                </PieChart>
            </ResponsiveContainer>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h4 className="barplot-title">Most accessible lines</h4>
              <IconButton onClick={handleOpenDialog}>
                <InfoIcon />
              </IconButton>
            </div>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart
                layout="vertical"
                data={tramLineAccessibility}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
           
                <XAxis type="number" domain={[0, 1]} hide={true} />
                <YAxis dataKey="name" type="category" />
                <Tooltip />
                <Bar dataKey="ratio" fill="#8884d8" barSize={20}>
                  {tramLineAccessibility.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`#FF6633`} />
                  ))}
                  <LabelList dataKey="ratio" position="insideRight" formatter={(value) => `${(value * 100).toFixed(1)}%`} />
                </Bar>
              </BarChart>
      </ResponsiveContainer>


      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"How is the tram-line accessibility score computed?"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            The accessibility metric of tram lines is computed by dividing a weighted sum of the number of accessible stations by the total number of stations for each tram line. 
            The weight of each station is determined by its accessibility level, where an accessible station is weighted twice as much as a station that is accessible with help, and a station that is not accessible is weighted zero.
             The tram lines are then sorted by their accessibility score in descending order.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary" autoFocus>
            Close
          </Button>
        </DialogActions>
      </Dialog>
        </div>
    );      
}
export default TramstopsStats;