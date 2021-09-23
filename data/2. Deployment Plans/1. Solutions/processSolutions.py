import sys
import json

if __name__ == "__main__":
    file_name = sys.argv[1]

    # create final file name 
    index_val = file_name.index('.')
    plan_name = file_name[0:index_val]

    # read the data file 
    data = open(sys.argv[1], 'r')

    # define dictionaries for the final data
    replace_bus = {}
    bus_distance = {}
    charge_sequence = {}
    charge_stations = {}
    equity_value = ""

    # process the data line by line for the final result 
    for line in data:
        if "value" in line:
            equity_line = line.split()
            equity_value = float(equity_line[4])
        else:
            tokens = line.split()
            if len(tokens) != 0:
                key, value = tokens[0], tokens[1]

                # process the buses to be replaced 
                if key[0] == 'Z':
                    bus = int(key[1:])
                    replace_bus[bus] = int(value)
                
                # process the distances traveled
                elif key[0] == 'm':
                    bus_end = key.index('_')
                    bus = int(key[1:bus_end])
                    if bus not in bus_distance:
                        bus_distances = []
                        bus_distances.append(float(value))
                        bus_distance[bus] = bus_distances
                    else:
                        bus_distances = bus_distance.get(bus)
                        bus_distances.append(float(value))
                        bus_distance[bus] = bus_distances
                
                # process the bus charge sequence
                elif key[0] == 'X':
                    bus_end = key.index('_')
                    bus = int(key[1:bus_end])
                    if bus not in charge_sequence:
                        bus_charge = []
                        bus_charge.append(int(value))
                        charge_sequence[bus] = bus_charge
                    else:
                        bus_charge = charge_sequence.get(bus)
                        bus_charge.append(int(value))
                        charge_sequence[bus] = bus_charge
                
                # process the number of charge stations 
                elif key[0] == 'Y':
                    stop_id = int(key[1:])
                    charge_stations[stop_id] = int(value)

    processed_data = {"Environmental Equity": equity_value,
                 "Replace Buses": replace_bus,
                 "Bus Distance": bus_distance,
                 "Charge Sequence": charge_sequence,
                 "Charge Stations": charge_stations}

    # write to a json file with the specified plan name
    with open(plan_name + '.json', 'w') as outfile:
        json.dump(processed_data, outfile)
