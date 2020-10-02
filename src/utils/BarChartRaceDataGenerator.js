import moment from 'moment';
import rfdc from 'rfdc';
import * as STATUS from './StatusTypes';

const deepClone = rfdc();

const users = [
    {
        "id": 1,
        "name": "Albert Pérez Moliné",
        "brokerage": {
            "id": 1,
            "name": "Hiscox",
            "network": {
                "id": 1,
                "name": "RED HISCOX CONNECT"
            }
        },
        "office": {
            "id": 1,
            "name": "Hiscox Office"
        }
    },
    {
        "id": 2,
        "name": "Carlos Luis Sanchez Torres",
        "brokerage": {
            "id": 2,
            "name": "Abella Mediación",
            "network": {
                "id": 2,
                "name": "RED ESPABROK"
            }
        },
        "office": {
            "id": 1,
            "name": "Hiscox Office"
        }
    },
    {
        "id": 3,
        "name": "Estefania Morales",
        "brokerage": {
            "id": 3,
            "name": "ALBROKSA",
            "network": {
                "id": 1,
                "name": "RED Hiscox Connect"
            }
        },
        "office": {
            "id": 1,
            "name": "Hiscox Office"
        }
    },
    {
        "id": 4,
        "name": "Laura Santana",
        "brokerage": {
            "id": 4,
            "name": "AICO MEDIACIÓN",
            "network": {
                "id": 1,
                "name": "RED Hiscox Connect"
            }
        },
        "office": {
            "id": 1,
            "name": "Hiscox Office"
        }
    },
    {
        "id": 5,
        "name": "Manuel Naranjo González-Coviella",
        "brokerage": {
            "id": 5,
            "name": "AON",
            "network": {
                "id": 3,
                "name": "RED AON"
            }
        },
        "office": {
            "id": 1,
            "name": "Hiscox Office"
        }
    },
    {
        "id": 6,
        "name": "Alicia Palacín Ortuño",
        "brokerage": {
            "id": 5,
            "name": "AON",
            "network": {
                "id": 3,
                "name": "RED AON"
            }
        },
        "office": {
            "id": 1,
            "name": "Hiscox Office"
        }
    }
];

const productVariants = [
    {
        "idProductVariant": 15,
        "name": "CyberClear",
        "product": {
            "id": 7,
            "name": "CyberClear",
        },
    },
    {
        "idProductVariant": 1,
        "name": "Responsabilidad Civil Profesional",
        "product": {
            "id": 3,
            "name": "Responsabilidad Civil Profesional",
        },
    },
    {
        "idProductVariant": 10,
        "name": "Responsabilidad Civil General",
        "product": {
            "id": 4,
            "name": "Responsabilidad Civil General",
        },
    },
    {
        "idProductVariant": 14,
        "name": "Daños Materiales TodoRiesgo",
        "product": {
            "id": 1,
            "name": "Daños Materiales",
        },
    },
]

const sources = ["MyHiscox", "API", "Magic"];

export const generateData = () => {

    //let startDate = moment('20190101','YYYYMMDD');
    let startDate = moment().subtract(1, 'day');
    let endDate = moment().add(2, 'week').endOf('day');

    let elapsedDays = moment.duration(endDate.diff(startDate)).asDays();

    let data = [];
    let maxId = 1;

    const AVERAGE_PROJECTS_PER_DAY_MIN = 40;
    const AVERAGE_PROJECTS_PER_DAY_MAX = 50;

    let status = STATUS.APPROVED;

    for (let i = 0; i < elapsedDays; i++) {

        let date = startDate.clone().add(i, 'days');
        let numProjects = getRandomInt(AVERAGE_PROJECTS_PER_DAY_MIN, AVERAGE_PROJECTS_PER_DAY_MAX);
        let projects = [];
        let volume = 0;

        for (let k = 0; k < numProjects; k++) {

            let minimumRate = 0;
            let fullTotalRate = 0;

            let numProducts = getRandomInt(1, 3);

            let products = [];
            for (let p = 0; p < numProducts; p++) {
                const randomRate = getRandomInt(100, 500);
                minimumRate += randomRate;
                fullTotalRate += randomRate;

                let productVariant = getRandomValueFromArray(productVariants);
                productVariant.minimumRate = randomRate;
                productVariant.totalRate = randomRate;
                products.push(productVariant);
            }

            volume += fullTotalRate;

            let createdAt = date.clone().add(getRandomFloat(0, 1440), 'minutes'); // (Day between startDate, today) + (8:00,20:00)
            let finishedAt = createdAt.clone().add(getRandomFloat(60, 180), 'minutes'); // finishedAt (30, 120min) from createdAt

            let project = {
                "id": maxId++,
                "reference": "AX" + 0 + k,
                "status": status,
                "user": getRandomValueFromArray(users),
                "createdAt": createdAt.format('YYYY-MM-DD HH:mm:ss'),
                "finishedAt": finishedAt.format('YYYY-MM-DD HH:mm:ss'),
                "elapsedTime": moment.duration(finishedAt.diff(createdAt)).asMinutes(),
                "productVariants": products,
                "isClean": ((Math.round(Math.random())) === 0),
                "source": getRandomStringFromArray(sources),
                "minimumRate": minimumRate,
                "totalRate": fullTotalRate,
            }
            projects.push(project);
        }

        data.push({
            date: date,
            projects: projects,
            volume: volume,
        })
    }

    return data;
}

//export const updateData = (data, actualMoment) => {}
const getRandomStringFromArray = (array) => {
    return array[(getRandomInt(0, 100) % array.length)]
}

const getRandomValueFromArray = (array) => {
    return { ...array[(getRandomInt(0, 100) % array.length)] };
};
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min)) + min;
const getRandomFloat = (min, max) => Math.random() * (max - min) + min;

