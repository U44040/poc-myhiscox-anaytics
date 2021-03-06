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
    },
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

export const averageSales = {
    1: { average: 200, n: 150 },
    10: { average: 400, n: 200 },
    14: { average: 600, n: 100 },
    15: { average: 546, n: 200 },
};

const STATUS_LIST = [STATUS.DRAFT, STATUS.PENDING_INFO, STATUS.BINDING_REQUEST_PENDING, STATUS.MANUAL_QUOTATION_REQUIRED, STATUS.TO_BE_ISSUED, STATUS.APPROVED, STATUS.REJECTED];

export const generateData = (momentInitial) => {

    let data = [];

    let maxId = 1;

    const status = STATUS_LIST;
    for (let i = 0; i < status.length; i++) {
        data.push({
            status: status[i],
            projects: [],
        })
    }

    let numProjects = getRandomInt(40, 50);
    let projects = [];

    for (let k = 0; k < numProjects; k++) {

        let minimumRate = 0;
        let fullTotalRate = 0;
        let fullPercentAverage = 0;

        let numProducts = getRandomInt(1, 3);

        let products = [];
        for (let p = 0; p < numProducts; p++) {
            const randomRate = getRandomInt(100, 500);
            minimumRate += randomRate;
            fullTotalRate += randomRate;

            let productVariant = getRandomValueFromArray(productVariants);
            productVariant.minimumRate = randomRate;
            productVariant.totalRate = randomRate;
            productVariant.percentAverage = calculatePercentAverage(productVariant.totalRate, productVariant);
            fullPercentAverage += productVariant.percentAverage;
            products.push(productVariant);
        }

        fullPercentAverage = (fullPercentAverage / products.length);

        let isClean = ((Math.round(Math.random())) === 0)

        let createdAt = momentInitial.clone().add(getRandomFloat(0, 720), 'minutes'); // (8:00,20:00)
        let finishedAt = createdAt.clone().add(getRandomFloat(60, 180), 'minutes'); // finishedAt (30, 120min) from createdAt
        let timePoints = calculateTimePoints(createdAt, finishedAt);

        let project = {
            "id": maxId++,
            "reference": "AX" + 0 + k,
            "status": status[0],
            "user": getRandomValueFromArray(users),
            "createdAt": createdAt.format('YYYY-MM-DD HH:mm:ss'),
            "finishedAt": finishedAt.format('YYYY-MM-DD HH:mm:ss'),
            "timePoints": timePoints, // for status change
            "elapsedTime": moment.duration(momentInitial.diff(createdAt)).asMinutes(),
            "productVariants": products,
            "isClean": isClean,
            "source": ((Math.round(Math.random())) === 0 ? "MyHiscox" : "API"),
            "minimumRate": minimumRate,
            "totalRate": fullTotalRate,
            "fullPercentAverage": fullPercentAverage,
        }
        projects.push(project);
    }

    let statusDraft = data[STATUS_LIST.indexOf(STATUS.DRAFT)];
    statusDraft.projects = projects;

    return data;
}

export const updateData = (d, actualMoment) => {
    // deep copy from input data to avoid modification of original    
    let data = deepClone(d);
    for (let status of data) {

        // Re-calculate percent
        for (let project of status.projects) {
            project.fullPercentAverage = 0;
            for (let productVariant of project.productVariants) {
                productVariant.percentAverage = calculatePercentAverage(productVariant.totalRate, productVariant);
                project.fullPercentAverage += productVariant.percentAverage;
            }
            project.fullPercentAverage = (project.fullPercentAverage / project.productVariants.length);
        }

        if (status.status === STATUS.APPROVED || status.status === STATUS.REJECTED) { continue; }
        for (let project of status.projects) {
            project.elapsedTime = moment.duration(actualMoment.diff(project.createdAt)).asMinutes();
            if (actualMoment.format('YYYY-MM-DD HH:mm:ss') >= project.timePoints[0]) {
                let nextState = getNextState(project);
                let copyProject = deepClone(project);

                if (nextState === STATUS.APPROVED) {
                    recalculateAverageSales(project);
                }

                copyProject.status = nextState;
                copyProject.timePoints.shift();

                data[STATUS_LIST.indexOf(nextState)].projects.push(copyProject);
                project.remove = true;
            }
        }
        status.projects = status.projects.filter(d => d.remove != true);
    }
    return data;
}

const recalculateAverageSales = (project) => {
    for (let productVariant of project.productVariants) {
        let average = averageSales[productVariant.idProductVariant];
        average.average = (average.average * average.n + productVariant.totalRate) / (average.n+1) ;
        average.n++;
    }
}

const calculatePercentAverage = (rate, productVariant) => {
    return (rate - averageSales[productVariant.idProductVariant].average) / averageSales[productVariant.idProductVariant].average * 100;
}

const calculateTimePoints = (createdAt, finishedAt) => {
    let totalDuration = moment.duration(finishedAt.diff(createdAt)).asMinutes();
    let timePoint = createdAt.clone();
    let timePoints = [];
    for (let i = 0; i < 3; i++) {
        timePoint = timePoint.clone().add(totalDuration / 3, 'minutes');
        timePoints.push(timePoint.format('YYYY-MM-DD HH:mm:ss'));
    }
    return timePoints;
}

const getNextState = (project) => {

    switch (project.status) {
        case STATUS.DRAFT:
            if (project.isClean) {
                return STATUS.BINDING_REQUEST_PENDING;
            } else {
                return STATUS.PENDING_INFO;
            }


        case STATUS.PENDING_INFO:
            return STATUS.MANUAL_QUOTATION_REQUIRED;

        case STATUS.BINDING_REQUEST_PENDING:
            return STATUS.TO_BE_ISSUED;

        case STATUS.MANUAL_QUOTATION_REQUIRED:
        case STATUS.TO_BE_ISSUED:
            let approved = (Math.random() > 0.1);
            if (approved) { return STATUS.APPROVED }
            else { return STATUS.REJECTED }
    }
}

const getRandomValueFromArray = (array) => {
    return { ...array[(getRandomInt(0, 100) % array.length)] };
};
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min)) + min;
const getRandomFloat = (min, max) => Math.random() * (max - min) + min;

