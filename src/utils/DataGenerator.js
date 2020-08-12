import moment from 'moment';
import rfdc from 'rfdc';

const deepClone = rfdc();

const users = [
    {
        "id": 1,
        "name": "Hiscox User",
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
        "name": "Hiscox User 2",
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
        "name": "Hiscox User 3",
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
        "name": "Hiscox User 4",
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
        "name": "Hiscox User 5",
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

export const averageSales = {
    1: 200,
    10: 400,
    14: 600,
    15: 546,
};

export const generateData = () => {
    
    let data = [];
    
    let maxId = 1;

    const state = ['Draft', 'Policy Holder Step', 'Start Date Step', 'Pending Info', 'Binding Request Pending', 'Issued'];
    for (let i = 0; i < state.length; i++) {

        let numItems = 20 + getRandomInt(0,20);
        let projects = [];

        if (state[i] === 'Issued') {
            data.push({
                state: state[i],
                projects: projects,
            })
            continue;
        }

        for (let k = 0; k < numItems; k++) {

            let fullTotalRate = 0;
            let fullPercentAverage = 0;

            let numProducts = getRandomInt(1,3);

            let products = [];
            for (let p = 0; p < numProducts; p++) {

                const randomRate = getRandomInt(100,500);
                fullTotalRate += randomRate;

                let productVariant = getRandomValueFromArray(productVariants);
                productVariant.totalRate = randomRate;
                productVariant.percentAverage = (randomRate-averageSales[productVariant.idProductVariant])/averageSales[productVariant.idProductVariant]*100;
                fullPercentAverage+=productVariant.percentAverage;
                products.push(productVariant);
            }

            fullPercentAverage = (fullPercentAverage/numProducts);

            let isClean;
            if (state[i] === 'Pending Info') {
                isClean = false;
            } else if (['Start Date Step', 'Binding Request Pending'].includes(state[i])) {
                isClean = true;
            } else {
                isClean = ((Math.round(Math.random())) === 0)
            }

            let createdAt = moment().subtract(getRandomFloat(-10,10), 'minutes'); // createdAt with future / past (-10,+10min)
            let finishedAt = createdAt.clone().add(getRandomFloat(10, 20), 'minutes'); // finishedAt (10, 12min) from createdAt)

            let project = {
                "id": maxId++,
                "reference": "AX" + i + k,
                "user": getRandomValueFromArray(users),
                "createdAt": createdAt.format('YYYY-MM-DD HH:mm:ss'),
                "finishedAt": finishedAt.format('YYYY-MM-DD HH:mm:ss'),
                "elapsedTime": moment.duration(moment().diff(createdAt)).asMinutes(),
                "productVariants": products,
                "isClean": isClean,
                "source": ((Math.round(Math.random())) === 0 ? "web" : "api"),
                "totalRate": fullTotalRate,
                "fullPercentAverage": fullPercentAverage,
            }
            projects.push(project);
        }

        data.push({
            state: state[i],
            projects: projects,
        })
    }

    return data;
}

export const updateData = (d) => {
    // deep copy from input data to avoid modification of original    
    let data = deepClone(d);
    for (let state of data) {
        if (state.state === "Issued") { continue; }

        for (let project of state.projects) {
            project.elapsedTime = moment.duration(moment().diff(project.createdAt)).asMinutes();
            if (moment().format('YYYY-MM-DD HH:mm:ss') >= project.finishedAt) {
                data[5].projects.push(deepClone(project));
                project.remove = true;
            }
        }
        state.projects = state.projects.filter(d => d.remove != true);
    }
    return data;
}

const getRandomValueFromArray = (array) => {
    return {...array[(getRandomInt(0, 100) % array.length)]};
};
const getRandomInt = (min, max) => Math.floor(Math.random() * (max-min)) + min;
const getRandomFloat = (min, max) => Math.random() * (max-min) + min;

