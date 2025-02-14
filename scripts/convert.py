from dataknead import Knead, BaseLoader
import xmltodict

class OsmLoader(BaseLoader):
    EXTENSIONS = ["osm"]

    @staticmethod
    def read(f, **kwargs):
        try:
            with open('mapdata/cambridgemini.osm', 'r', encoding='utf-8') as file:
                xml_content = file.read()
                data = xmltodict.parse(xml_content)
                return data
            # Process the data
        except UnicodeDecodeError as e:
            print(f"Error decoding file: {e}")
            # Handle the error, possibly trying a different encoding
        except FileNotFoundError:
            print("File not found.")
        
        # return xmltodict.parse(f.read(), encoding="utf8") # add enc option here

    @staticmethod
    def write(f, data, **kwargs):
        xmldata = xmltodict.unparse(data, **kwargs)
        f.write(xmldata)

# Knead.add_loader(Knead, OsmLoader)
Knead("mbta_gtfs/stops.csv").write("stops.json", indent = 4)