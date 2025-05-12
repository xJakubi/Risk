/**
 * Extended territories data for Risk game
 */
const TERRITORIES_DATA = {
    // North America
    'Alaska': { 
        continent: 'North America', 
        adjacent: ['Northwest Territory', 'Alberta', 'Kamchatka'],
        x: 55, 
        y: 90 
    },
    'Northwest Territory': { 
        continent: 'North America', 
        adjacent: ['Alaska', 'Alberta', 'Greenland', 'Ontario'],
        x: 120, 
        y: 70 
    },
    'Greenland': { 
        continent: 'North America', 
        adjacent: ['Northwest Territory', 'Ontario', 'Quebec', 'Iceland'],
        x: 240, 
        y: 50 
    },
    'Alberta': { 
        continent: 'North America', 
        adjacent: ['Alaska', 'Northwest Territory', 'Ontario', 'Western United States'],
        x: 110, 
        y: 120 
    },
    'Ontario': { 
        continent: 'North America', 
        adjacent: ['Northwest Territory', 'Alberta', 'Greenland', 'Quebec', 'Western United States', 'Eastern United States'],
        x: 150, 
        y: 130 
    },
    'Quebec': { 
        continent: 'North America', 
        adjacent: ['Greenland', 'Ontario', 'Eastern United States'],
        x: 190, 
        y: 120 
    },
    'Western United States': { 
        continent: 'North America', 
        adjacent: ['Alberta', 'Ontario', 'Eastern United States', 'Mexico'],
        x: 120, 
        y: 160 
    },
    'Eastern United States': { 
        continent: 'North America', 
        adjacent: ['Ontario', 'Quebec', 'Western United States', 'Mexico', 'Caribbean'],
        x: 160, 
        y: 170 
    },
    'Mexico': { 
        continent: 'North America', 
        adjacent: ['Western United States', 'Eastern United States', 'Colombia', 'Caribbean'],
        x: 135, 
        y: 210 
    },

    // Central America (Added)
    'Caribbean': { 
        continent: 'Central America', 
        adjacent: ['Eastern United States', 'Mexico', 'Venezuela', 'Colombia'],
        x: 180, 
        y: 210 
    },
    'Colombia': { 
        continent: 'Central America', 
        adjacent: ['Mexico', 'Caribbean', 'Venezuela', 'Peru'],
        x: 160, 
        y: 240 
    },
    'Panama': { 
        continent: 'Central America', 
        adjacent: ['Colombia', 'Venezuela', 'Costa Rica'],
        x: 145, 
        y: 230 
    },
    'Costa Rica': { 
        continent: 'Central America', 
        adjacent: ['Panama', 'Nicaragua'],
        x: 130, 
        y: 225 
    },
    'Nicaragua': { 
        continent: 'Central America', 
        adjacent: ['Costa Rica', 'Honduras'],
        x: 135, 
        y: 220 
    },
    'Honduras': { 
        continent: 'Central America', 
        adjacent: ['Nicaragua', 'Guatemala', 'El Salvador'],
        x: 140, 
        y: 215 
    },
    'Guatemala': { 
        continent: 'Central America', 
        adjacent: ['Honduras', 'Mexico', 'El Salvador'],
        x: 135, 
        y: 210 
    },
    'El Salvador': { 
        continent: 'Central America', 
        adjacent: ['Honduras', 'Guatemala'],
        x: 130, 
        y: 215 
    },

    // South America
    'Venezuela': { 
        continent: 'South America', 
        adjacent: ['Caribbean', 'Colombia', 'Brazil', 'Peru'],
        x: 180, 
        y: 250 
    },
    'Peru': { 
        continent: 'South America', 
        adjacent: ['Colombia', 'Venezuela', 'Brazil', 'Argentina', 'Chile'],
        x: 170, 
        y: 280 
    },
    'Brazil': { 
        continent: 'South America', 
        adjacent: ['Venezuela', 'Peru', 'Argentina', 'North Africa'],
        x: 200, 
        y: 280 
    },
    'Argentina': { 
        continent: 'South America', 
        adjacent: ['Peru', 'Brazil', 'Chile'],
        x: 180, 
        y: 320 
    },
    'Chile': { 
        continent: 'South America', 
        adjacent: ['Peru', 'Argentina'],
        x: 160, 
        y: 310 
    },
    'Uruguay': { 
        continent: 'South America', 
        adjacent: ['Brazil', 'Argentina'],
        x: 190, 
        y: 310 
    },
    'Paraguay': { 
        continent: 'South America', 
        adjacent: ['Brazil', 'Argentina', 'Bolivia'],
        x: 185, 
        y: 290 
    },
    'Bolivia': { 
        continent: 'South America', 
        adjacent: ['Peru', 'Brazil', 'Paraguay', 'Chile'],
        x: 175, 
        y: 290 
    },

    // Europe
    'Iceland': { 
        continent: 'Europe', 
        adjacent: ['Greenland', 'Scandinavia', 'Great Britain'],
        x: 280, 
        y: 90 
    },
    'Great Britain': { 
        continent: 'Europe', 
        adjacent: ['Iceland', 'Scandinavia', 'Northern Europe', 'Western Europe'],
        x: 280, 
        y: 120 
    },
    'Scandinavia': { 
        continent: 'Europe', 
        adjacent: ['Iceland', 'Great Britain', 'Northern Europe', 'Russia'],
        x: 320, 
        y: 80 
    },
    'Western Europe': { 
        continent: 'Europe', 
        adjacent: ['Great Britain', 'Northern Europe', 'Southern Europe', 'North Africa'],
        x: 280, 
        y: 160 
    },
    'Northern Europe': { 
        continent: 'Northern Europe', 
        adjacent: ['Great Britain', 'Scandinavia', 'Western Europe', 'Southern Europe', 'Russia', 'Ukraine'],
        x: 320, 
        y: 130 
    },
    'Southern Europe': { 
        continent: 'Southern Europe', 
        adjacent: ['Western Europe', 'Northern Europe', 'Ukraine', 'North Africa', 'Egypt', 'Turkey'],
        x: 320, 
        y: 160 
    },
    'Ukraine': { 
        continent: 'Europe', 
        adjacent: ['Northern Europe', 'Southern Europe', 'Russia', 'Ural', 'Afghanistan', 'Turkey'],
        x: 360, 
        y: 120 
    },
    'Iberian Peninsula': { 
        continent: 'Southern Europe', 
        adjacent: ['Western Europe', 'North Africa', 'Morocco'],
        x: 270, 
        y: 160 
    },
    'Italy': { 
        continent: 'Southern Europe', 
        adjacent: ['Western Europe', 'Southern Europe', 'Northern Africa'],
        x: 310, 
        y: 150 
    },
    'Balkans': { 
        continent: 'Southern Europe', 
        adjacent: ['Southern Europe', 'Ukraine', 'Turkey'],
        x: 330, 
        y: 150 
    },

    // Africa
    'North Africa': { 
        continent: 'Africa', 
        adjacent: ['Western Europe', 'Southern Europe', 'Egypt', 'East Africa', 'Central Africa', 'Morocco', 'Brazil'],
        x: 290, 
        y: 220 
    },
    'Egypt': { 
        continent: 'Africa', 
        adjacent: ['Southern Europe', 'North Africa', 'East Africa', 'Middle East', 'Turkey'],
        x: 330, 
        y: 200 
    },
    'East Africa': { 
        continent: 'Africa', 
        adjacent: ['North Africa', 'Egypt', 'Central Africa', 'South Africa', 'Madagascar', 'Middle East'],
        x: 350, 
        y: 250 
    },
    'Central Africa': { 
        continent: 'Africa', 
        adjacent: ['North Africa', 'East Africa', 'South Africa', 'Namibia', 'Nigeria'],
        x: 320, 
        y: 260 
    },
    'South Africa': { 
        continent: 'Africa', 
        adjacent: ['Central Africa', 'East Africa', 'Madagascar', 'Namibia'],
        x: 330, 
        y: 310 
    },
    'Madagascar': { 
        continent: 'Africa', 
        adjacent: ['East Africa', 'South Africa'],
        x: 365, 
        y: 300 
    },
    'Morocco': { 
        continent: 'Africa', 
        adjacent: ['North Africa', 'Iberian Peninsula', 'Western Europe'],
        x: 270, 
        y: 190 
    },
    'Nigeria': { 
        continent: 'Africa', 
        adjacent: ['North Africa', 'Central Africa'],
        x: 300, 
        y: 230 
    },
    'Namibia': { 
        continent: 'Africa', 
        adjacent: ['Central Africa', 'South Africa'],
        x: 315, 
        y: 290 
    },
    'Ethiopia': { 
        continent: 'Africa', 
        adjacent: ['East Africa', 'Egypt'],
        x: 340, 
        y: 230 
    },

    // Middle East (Added)
    'Turkey': { 
        continent: 'Middle East', 
        adjacent: ['Southern Europe', 'Ukraine', 'Egypt', 'Middle East', 'Balkans'],
        x: 345, 
        y: 170 
    },
    'Middle East': { 
        continent: 'Middle East', 
        adjacent: ['Egypt', 'Turkey', 'East Africa', 'Afghanistan', 'India', 'Saudi Arabia'],
        x: 370, 
        y: 190 
    },
    'Saudi Arabia': { 
        continent: 'Middle East', 
        adjacent: ['Middle East', 'Egypt'],
        x: 360, 
        y: 210 
    },
    'Iran': { 
        continent: 'Middle East', 
        adjacent: ['Middle East', 'Afghanistan', 'Pakistan'],
        x: 380, 
        y: 180 
    },
    'Pakistan': { 
        continent: 'Middle East', 
        adjacent: ['Iran', 'Afghanistan', 'India'],
        x: 395, 
        y: 190 
    },

    // Asia
    'Russia': { 
        continent: 'Asia', 
        adjacent: ['Scandinavia', 'Northern Europe', 'Ukraine', 'Ural', 'Siberia'],
        x: 390, 
        y: 90 
    },
    'Ural': { 
        continent: 'Asia', 
        adjacent: ['Russia', 'Ukraine', 'Afghanistan', 'Siberia', 'China'],
        x: 420, 
        y: 110 
    },
    'Siberia': { 
        continent: 'Asia', 
        adjacent: ['Russia', 'Ural', 'China', 'Mongolia', 'Yakutsk', 'Irkutsk'],
        x: 450, 
        y: 80 
    },
    'Yakutsk': { 
        continent: 'Asia', 
        adjacent: ['Siberia', 'Irkutsk', 'Kamchatka'],
        x: 490, 
        y: 60 
    },
    'Kamchatka': { 
        continent: 'Asia', 
        adjacent: ['Yakutsk', 'Irkutsk', 'Mongolia', 'Japan', 'Alaska'],
        x: 520, 
        y: 80 
    },
    'Afghanistan': { 
        continent: 'Asia', 
        adjacent: ['Ukraine', 'Ural', 'China', 'India', 'Middle East'],
        x: 400, 
        y: 150 
    },
    'China': { 
        continent: 'Asia', 
        adjacent: ['Ural', 'Siberia', 'Mongolia', 'Afghanistan', 'India', 'Southeast Asia'],
        x: 450, 
        y: 170 
    },
    'Mongolia': { 
        continent: 'Asia', 
        adjacent: ['Siberia', 'Irkutsk', 'Kamchatka', 'China', 'Japan'],
        x: 480, 
        y: 130 
    },
    'Japan': { 
        continent: 'Asia', 
        adjacent: ['Kamchatka', 'Mongolia'],
        x: 520, 
        y: 150 
    },
    'Irkutsk': { 
        continent: 'Asia', 
        adjacent: ['Siberia', 'Yakutsk', 'Kamchatka', 'Mongolia'],
        x: 470, 
        y: 100 
    },
    'India': { 
        continent: 'Asia', 
        adjacent: ['Afghanistan', 'China', 'Southeast Asia', 'Middle East', 'Pakistan'],
        x: 420, 
        y: 200 
    },
    'Southeast Asia': { 
        continent: 'Asia', 
        adjacent: ['China', 'India', 'Indonesia'],
        x: 460, 
        y: 220 
    },
    'Korea': { 
        continent: 'Asia', 
        adjacent: ['China', 'Mongolia', 'Japan'],
        x: 490, 
        y: 160 
    },
    'Tibet': { 
        continent: 'Asia', 
        adjacent: ['China', 'India', 'Afghanistan'],
        x: 430, 
        y: 180 
    },
    'Vietnam': { 
        continent: 'Asia', 
        adjacent: ['Southeast Asia', 'China', 'Indonesia'],
        x: 470, 
        y: 210 
    },

    // Australia
    'Indonesia': { 
        continent: 'Australia', 
        adjacent: ['Southeast Asia', 'New Guinea', 'Western Australia'],
        x: 480, 
        y: 260 
    },
    'New Guinea': { 
        continent: 'Australia', 
        adjacent: ['Indonesia', 'Western Australia', 'Eastern Australia'],
        x: 520, 
        y: 250 
    },
    'Western Australia': { 
        continent: 'Australia', 
        adjacent: ['Indonesia', 'New Guinea', 'Eastern Australia'],
        x: 500, 
        y: 300 
    },
    'Eastern Australia': { 
        continent: 'Australia', 
        adjacent: ['Western Australia', 'New Guinea', 'New Zealand'],
        x: 530, 
        y: 310 
    },
    'New Zealand': { 
        continent: 'Australia', 
        adjacent: ['Eastern Australia'],
        x: 550, 
        y: 330 
    },
    'Philippines': { 
        continent: 'Australia', 
        adjacent: ['Southeast Asia', 'Indonesia'],
        x: 490, 
        y: 220 
    }
};

// Define continents and their territories for easy access
const CONTINENTS = {
    'North America': [
        'Alaska', 'Northwest Territory', 'Greenland', 'Alberta', 
        'Ontario', 'Quebec', 'Western United States', 'Eastern United States', 'Mexico'
    ],
    'Central America': [
        'Caribbean', 'Colombia', 'Panama', 'Costa Rica', 
        'Nicaragua', 'Honduras', 'Guatemala', 'El Salvador'
    ],
    'South America': [
        'Venezuela', 'Peru', 'Brazil', 'Argentina', 
        'Chile', 'Uruguay', 'Paraguay', 'Bolivia'
    ],
    'Europe': [
        'Iceland', 'Great Britain', 'Scandinavia', 'Western Europe', 
        'Ukraine', 'Northern Europe'
    ],
    'Northern Europe': [
        'Northern Europe'
    ],
    'Southern Europe': [
        'Southern Europe', 'Italy', 'Balkans', 'Iberian Peninsula'
    ],
    'Africa': [
        'North Africa', 'Egypt', 'East Africa', 'Central Africa', 
        'South Africa', 'Madagascar', 'Morocco', 'Nigeria', 'Namibia', 'Ethiopia'
    ],
    'Middle East': [
        'Turkey', 'Middle East', 'Saudi Arabia', 'Iran', 'Pakistan'
    ],
    'Asia': [
        'Russia', 'Ural', 'Siberia', 'Yakutsk', 'Kamchatka', 
        'Afghanistan', 'China', 'Mongolia', 'Japan', 'Irkutsk', 
        'India', 'Southeast Asia', 'Korea', 'Tibet', 'Vietnam'
    ],
    'Australia': [
        'Indonesia', 'New Guinea', 'Western Australia', 
        'Eastern Australia', 'New Zealand', 'Philippines'
    ]
};
