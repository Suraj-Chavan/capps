import capps from "capps";

export async function cappsCollectionEventHandlers({ appName, collectionName }) {
    try {
        capps.ui[collectionName] = capps.ui[collectionName] || {};
        if (capps.ui[collectionName].form) return console.log(`Event handlers for ${collectionName} is already loaded`);
        await capps.rest[appName][collectionName].js['form'](
            {}, { parseText: true }
        )
            .then(function (scriptContent) {
                const script = document.createElement('script');
                script.type = 'text/javascript';
                script.text = scriptContent;
                document.head.appendChild(script);
            });
        return capps.ui[collectionName]?.form
    } catch {
        return null;
    }
}

export async function loadCappsListJsFile({ appName, collectionName }) {
    try {
        capps.ui[collectionName] = capps.ui[collectionName] || {};

        if (capps.ui[collectionName].list) {
            console.log(`Action handlers for ${collectionName} is already loaded`)
            return capps.ui[collectionName].list;
        };

        await capps.rest[appName][collectionName].js.list(
            {}, { parseText: true }
        )
            .then(function (scriptContent) {
                const script = document.createElement('script');
                script.type = 'text/javascript';
                script.text = scriptContent;
                document.head.appendChild(script);
            });

        capps.ui[collectionName].list = capps.ui[collectionName].list || null;

        return capps.ui[collectionName].list;
    } catch {
        capps.ui[collectionName].list = null;
        return null;
    }
}

export async function loadCappsCardJsFile({ appName, collectionName }) {
    try {
        capps.ui[collectionName] = capps.ui[collectionName] || {};

        const defaults = {
            template: "",
            style: "",
        }

        if (capps.ui[collectionName].card) {
            console.log(`Card template for ${collectionName} is already loaded`)
            return capps.ui[collectionName].card;
        };

        await capps.rest[appName][collectionName].js.card(
            {}, { parseText: true }
        )
            .then(function (scriptContent) {
                const script = document.createElement('script');
                script.type = 'text/javascript';
                script.text = scriptContent;
                document.head.appendChild(script);
            });

        capps.ui[collectionName].card = {
            ...defaults,
            ...(capps.ui[collectionName].card || {})
        };

        return capps.ui[collectionName].card;
    } catch {
        capps.ui[collectionName].card = defaults;
        return capps.ui[collectionName].card;
    }
}