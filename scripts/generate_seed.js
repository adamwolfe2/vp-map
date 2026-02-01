const fs = require('fs');
const https = require('https');

const MAPBOX_TOKEN = 'pk.eyJ1IjoiYWRhbXdvbGZlIiwiYSI6ImNtbDFqdzVrbjA4c3ozZXB0bjgzZDA3aHUifQ.pOYHyP86bpDXlVq1h2BE6w';

// Raw data from user (Block 1)
const RAW_DATA = `340 E North Water	High Rise Apartment	amenity lounge	Major City	Stockwell	398.00			1.00	$2253.15	$2253.15	
850 N Lake Shore Dr	High Rise Apartment	amenity lounge	Major City	Stockwell	198.00			1.00	$1132.36	$1132.36	
NEMA 14th Floor	High Rise Apartment	gym	Major City	Stockwell	800.00			1.00	$1748.05	$1748.05	
NEMA 16th Floor	High Rise Apartment	amenity lounge	Major City	Stockwell	800.00			1.00	$3887.45	$3887.45	
218 E Grand Ave	High Rise Apartment	amenity lounge	Major City	Stockwell	248.00			1.00	$1809.40	$1809.40	
633 W North Ave	High Rise Apartment	amenity lounge	Major City	Stockwell	261.00			1.00	$2872.12	$2872.12	
Westlyn Apartments Warrenville	Mid Rise Apartment	amenity lounge	Suburban	Mixed	242.00			2.00	$1131.24	$565.62	
1407 S Michigan Ave	High Rise Apartment	amenity lounge	Major City	Micromart	199.00			2.00	$1663.80	$831.90	
215 W Lake St	High Rise Apartment	lobby	Major City	Micromart	275.00			3.00	$3161.70	$1053.90	
220 E Illinois St	High Rise Apartment	amenity lounge	Major City	Mixed	486.00			4.00	$4552.91	$1138.23	
1001 S State	High Rise Apartment	amenity lounge	Major City	Micromart	400.00			2.00	$1866.10	$933.05	
1125 W Van Buren (Avra)	High Rise Apartment	lobby	Major City	Micromart	199.00			1.00	$1622.18	$1622.18	
369 W Grand (Onni)	High Rise Apartment	amenity lounge	Major City	Micromart	356.00			1.00	$5853.71	$5853.71	
Wolf Point West	High Rise Apartment	amenity lounge	Major City	Stockwell	509.00			3.00	$4658.81	$1552.94	
Hearthstone Apartments	Garden Style Apartment	clubhouse		Stockwell				1.00	$400.00	$400.00	
Terrace Station	Mid Rise Apartment	package room		Stockwell				2.00	$3200.00	$1600.00	
Mukilteo elementary School Staff Room	School	breakroom		Traditional Combo				1.00	$180.00	$180.00	
Olympic View Middle	School	breakroom		Traditional Combo				1.00	$260.00	$260.00	
Voyager Middle School	School	breakroom		Traditional Combo				1.00	$200.00	$200.00	
sage west loop	High Rise Apartment	lobby	Major City	Micromart	196.00			2.00	$1500.00	$750.00	
river west lofts	Mid Rise Apartment	amenity lounge	Major City	Cantaloupe Smart Store	164.00			1.00	$2200.00	$1600.00	
avenir	High Rise Apartment	lobby	Major City	Micromart	198.00			2.00	$1100.00	$550.00	
Aston	High Rise Apartment	package room	Major City	Stockwell	325.00			2.00	$2600.00	$1300.00	
77 W Huron	High Rise Apartment	laundry room	Major City	Stockwell	304.00			1.00	$3000.00	$3500.00	
Forward Pickleball	Gym	lobby		Micromart				1.00	$200.00	$200.00	
Jenkins Restoration	Other	amenity lounge		HaHa				1.00	$450.00	$450.00	
Larkspur	High Rise Apartment	mail room		Stockwell				1.00	$400.00	$400.00	
The Parlor	Mid Rise Apartment	mail room		Stockwell				1.00	$1200.00	$1200.00	
Rocket Lab	Manufacturing	breakroom		Other				1.00	$2000.00	$2000.00	
Fitzgerald Cadillac	Other	other		Cantaloupe Smart Store				2.00	$1800.00	$900.00	
Bayside Chrysler Dodge Ram Jeep	Other	other		Cantaloupe Smart Store				2.00	$2000.00	$1000.00	
Winfield Elementary	School	breakroom		Stockwell				1.00	$2300.00	$2300.00	
Bayside Toyota Prince Frederick	Other	other		Pico Cooler				1.00	$1300.00	$1300.00	
Bayside Kia of Waldorf	Other	other		Cantaloupe Smart Store				1.00	$2600.00	$2600.00	
Mansfield Service Partners	Office	breakroom		HaHa				2.00	$2000.00	$1000.00	
Kippford at Kemah Crossing	Garden Style Apartment	mail room		Stockwell				1.00	$500.00	$500.00	
San Palmilla	Mid Rise Apartment	amenity lounge		Stockwell				1.00	$500.00	$500.00	
Ondina Bellevue	High Rise Apartment	gym		Stockwell				3.00	$1500.00	$500.00	
Copal Bellevue	High Rise Apartment	gym		HaHa				1.00	$1000.00	$1000.00	
Metropolitan Appliances	Warehouse	breakroom		HaHa				1.00	$1500.00	$1500.00	
Wolf Point East	High Rise Apartment	amenity lounge	Major City	Stockwell	686.00			1.00	$5449.00	$4000.00	
2335 N Lincoln Ave	High Rise Apartment	gym	Major City	Stockwell	269.00			1.00	$1075.00		
2345 N Lincoln Ave	High Rise Apartment	gym	Major City	Stockwell	269.00			1.00	$1332.00		
50 Canterfield	Garden Style Apartment	clubhouse	Suburban	Micromart	352.00			1.00	$200.00		
2200 Progress	High Rise Apartment	other	Suburban	Micromart	260.00			2.00	$805.00		
520 N Kingsbury	High Rise Apartment	amenity lounge	Major City	Micromart	420.00			2.00	$3314.00		
1140 S Wabash	High Rise Apartment	amenity lounge	Major City	Micromart	320.00			2.00	$2333.00		
808 S Michigan	High Rise Apartment	lobby	Major City	Stockwell	479.00			1.00	$6000.00		
360 W Hubbard	High Rise Apartment	amenity lounge	Major City	Micromart	450.00			2.00	$1950.00		
111 W Wacker	High Rise Apartment	amenity lounge	Major City	Micromart	511.00			2.00	$3550.00		
1114  W Carroll	High Rise Apartment	amenity lounge	Major City	Micromart	325.00			2.00	$1961.00		
750 N Dearborn	High Rise Apartment	laundry room	Major City	Micromart	384.00			2.00	$2368.00		
1130 N Dearborn	High Rise Apartment	laundry room	Major City	Micromart	394.00			2.00	$1027.00		
29 S LaSalle	High Rise Apartment	amenity lounge	Major City	Micromart	218.00			2.00	$1534.00		
Argentum	Warehouse	breakroom	Suburban	Micromarket		75	0	1.00	$850.00		
617 W Bittersweet	Shelter	lobby	Major City	Traditional Combo		30	650	4.00	$6250.00		
469 W Huron	High Rise Apartment	mail room	Major City	Stockwell	275.00			1.00	$2670.00		
640 N Wells	High Rise Apartment	amenity lounge	Major City	Micromart	250.00			2.00	$1253.00		
450 Warrenville Rd	High Rise Apartment	clubhouse	Suburban	Micromart	310.00			3.00	$2100.00		
1000 S Clark	High Rise Apartment	amenity lounge	Major City	Micromart	469.00			3.00	$4700.00		
222 W Erie	High Rise Apartment	package room	Major City	Micromart	198.00			2.00	$1150.00		
545 N McClurg	High Rise Apartment	mail room	Major City	Micromart	490.00			2.00	$2100.00		
1333 S Wabash	High Rise Apartment	amenity lounge	Major City	Micromart	307.00			2.00	$1000.00		
1730 N Clark	High Rise Apartment	amenity lounge	Major City	Micromart	575.00			2.00	$2705.00		
166 N Aberdeen	High Rise Apartment	amenity lounge	Major City	Stockwell	223.00			1.00	$1005.00		
1401 S State	High Rise Apartment	lobby	Major City	Micromart	278.00			2.00	$2425.00`;

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const geocode = async (address) => {
    return new Promise((resolve, reject) => {
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${MAPBOX_TOKEN}&limit=1`;
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (json.features && json.features.length > 0) {
                        const feat = json.features[0];
                        resolve({
                            center: feat.center,
                            context: feat.context || []
                        });
                    } else {
                        resolve(null);
                    }
                } catch (e) { resolve(null); }
            });
        }).on('error', () => resolve(null));
    });
};

const processData = async () => {
    const lines = RAW_DATA.trim().split('\n');
    console.log(`Processing ${lines.length} locations...`);

    const clients = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;

        const cols = line.split('\t');
        if (cols.length < 2) continue; // Skip bad lines

        let address = cols[0].trim();
        const type = cols[1]?.trim();
        const placement = cols[2]?.trim();
        const isMajorCity = (cols[3] || '').trim() === 'Major City';

        // Enhance address for Chicago
        if (isMajorCity && !address.toLowerCase().includes('chicago')) {
            address += ', Chicago, IL';
        }

        // Clean revenue string
        const revStr = (cols[9] || '').replace('$', '').trim();
        const monthlyRevenue = parseFloat(revStr) || 0;

        const machines = parseFloat(cols[8] || '0') || 0;

        // Determine Status based on logic (or just Active)
        const status = 'Active';

        // Determine Membership Level based on Revenue
        let membershipLevel = 'Bronze';
        if (monthlyRevenue > 4000) membershipLevel = 'Platinum';
        else if (monthlyRevenue > 2000) membershipLevel = 'Gold';
        else if (monthlyRevenue > 1000) membershipLevel = 'Silver';

        process.stdout.write(`Geocoding (${i + 1}/${lines.length}): ${address}... `);

        const geoResult = await geocode(address);
        await delay(100); // Rate limiting

        let client = {
            id: `mock-loc-${i}`,
            fullName: cols[0].trim(),
            clientId: `LOC-${1000 + i}`,
            status: status,
            membershipLevel: membershipLevel,
            totalMonthlyRevenue: monthlyRevenue,
            totalNumberOfMachines: machines,
            dateAdded: new Date().toISOString(),
            // Map details
            location1PropertyType: type,
            location1MachineType: cols[4]?.trim() || 'Mixed',
            notes: `Placement: ${placement}. Type: ${type}`,
        };

        if (geoResult) {
            client.longitude = geoResult.center[0];
            client.latitude = geoResult.center[1];
            // Extract context
            const zip = geoResult.context.find(c => c.id.startsWith('postcode'));
            const place = geoResult.context.find(c => c.id.startsWith('place'));
            const region = geoResult.context.find(c => c.id.startsWith('region'));

            if (zip) client.zipCode = zip.text;
            if (place) client.city = place.text;
            if (region) client.state = region.short_code ? region.short_code.replace('US-', '') : region.text;

            console.log('OK');
        } else {
            console.log('FAILED');
        }

        clients.push(client);
    }

    const content = `// @ts-nocheck
// Auto-generated mock data from user CSV
export const MOCK_DATA = ${JSON.stringify(clients, null, 2)};
`;

    fs.writeFileSync('lib/mock_data.ts', content);
    console.log(`\nDone! Wrote ${clients.length} clients to lib/mock_data.ts`);
};

processData();
