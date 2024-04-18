import logo from './logo.svg';
import './App.css';
import {
  Box,
  Button,
  Grid, InputLabel,
  MenuItem,
  Paper,
  Select, Table, TableBody, TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField
} from "@mui/material";
import {useEffect, useState} from "react";
import {getLocations, isNameValid} from "./mock-api/apis";

const minimumTableRows = 5;
const debounceDuration = 500;

function App() {
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isCheckingName, setIsCheckingName] = useState(false);
  const [possibleLocations, setPossibleLocations] = useState([]);
  const [location, setLocation] = useState("");
  const [tableArray, setTableArray] = useState([]);

  useEffect(() => {
    getLocations()
      .then(locations => {
        setPossibleLocations(locations);
      })
      .catch((error) => {
        // log to error logging system
        console.log("Error in get locations")
      })
      .finally(() => {
        setLoading(false)
      })
  }, []);

  useEffect(() => {
    // set up debouncer to prevent calls every keystroke
    const timeoutId = setTimeout(() => {
      validateName(name);
    }, debounceDuration)
    return () => clearTimeout(timeoutId)
  }, [name, debounceDuration]);

  const handleNameChange = event => {
    // whenever input changes, disable submit until name checking done
    setIsCheckingName(true);
    setName(event.target.value);
    setNameError(false);
  }

  const handleLocationChange = event => {
    setLocation(event.target.value)
  }

  const validateName = (inputName) => {
    isNameValid(inputName)
      .then(nameValid => {
        // name invalid
        if(!nameValid){
          setNameError(true);
        }
      })
      .catch(error => {
        // log to error  handling service
        console.log("Error in Name Validation")
      }).finally(() => {
        setIsCheckingName(false);
    })
  }

  const handleClear = () => {
    // reset all values to default
    setName("");
    setLocation("");
    setTableArray([]);
  }

  const handleAdd = () => {
    // validate all data fields
    if(name !== "" && location !== "" && !isCheckingName && !nameError){
      // update array
      setTableArray([...tableArray, {name, location}]);
      setName("");
      setLocation("");
    }
  }

  const tableRowComponent = (tableRowData, index) => {
    return <TableRow
      key={tableRowData ? `${tableRowData.name + index}-table-row` : `${index}-table-row`}
      // zebra stripes to assist user
      sx={{ '&:last-child td, &:last-child th': { border: 0 }, 'backgroundColor': (index)%2 ? 'lightgray' : ''}}
    >
      <TableCell component="th" scope="row">
        {/* add empty white space to not disturb table layout */}
        {tableRowData ? tableRowData.name : '\u00A0'}
      </TableCell>
      {/* add empty white space to not disturb table layout */}
      <TableCell>{tableRowData ? tableRowData.location : '\u00A0'}</TableCell>
    </TableRow>
  }

  return (
    <div className={"App"}>
      <Grid container justifyContent={"center"}>
      <Grid container item xs={6} mt={6} minWidth={'500px'} >
      <form autoComplete="off">
        <Grid container>
          <Grid container item pb={1}>
            <Grid item xs={2} mt={2} fontSize={"18px"}>
              <label htmlFor={"name"}>
                Name
              </label>
            </Grid>
            <Grid item xs={10}>
              <TextField
                required
                error={nameError}
                fullWidth
                id="name"
                value={name}
                label={name==="" ? "Name" : ""}
                onChange={handleNameChange}
                InputLabelProps={{shrink: false}}
                // could be improved by slight shifting of form elements as helper text appears
                helperText={isCheckingName ? "Checking if name available" : nameError ? "This name has already been taken. Try again." : ""}
                variant="outlined"
              />
            </Grid>
          </Grid>
          <Grid container>
            <Grid item xs={2} mt={2} fontSize={"18px"}>
              <label htmlFor={"name"}>
                Location
              </label>
            </Grid>
            <Grid item xs={10}>
              <Select
                labelId={'location'}
                fullWidth
                id={'location'}
                value={location}
                onChange={handleLocationChange}
                sx={{textAlign: 'left'}}
              >
                {loading ?
                <MenuItem disabled><em>Loading...</em></MenuItem> :
                possibleLocations.map(location => <MenuItem value={location}>{location}</MenuItem>)}
              </Select>
            </Grid>
          </Grid>
          <Grid item xs={12} py={2} textAlign={'right'}>
            {/* if the expected delay is less than 2 seconds, disabling buttons should be enough. If the expected delay was longer, add a loading spinner*/}
            <Button disabled={isCheckingName || loading} variant="contained" color="primary" onClick={handleClear} sx={{marginRight: 5, boxShadow: '3px 3px 7px gray' }}>
              Clear
            </Button>
            {/* Usually I put Add buttons on the left and Clear on the right, but this follows the design */}
            <Button disabled={isCheckingName || nameError || loading} variant="contained" color="primary" onClick={handleAdd} sx={{boxShadow: '3px 3px 7px gray' }}>
              Add
            </Button>
          </Grid>
        </Grid>
      </form>
        <TableContainer component={Paper}>
          <Table aria-label="name and location table">
            <TableHead>
              <TableRow sx={{ backgroundColor: 'darkgrey'}}>
                <TableCell>Name</TableCell>
                <TableCell>Location</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* fill in empty rows in table */}
              {tableArray.length < minimumTableRows ?
                tableArray.concat(Array.from(Array(minimumTableRows - tableArray.length))).map(tableRowComponent) :
                tableArray.map(tableRowComponent)
              }
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
      </Grid>
    </div>
  );
}

export default App;
