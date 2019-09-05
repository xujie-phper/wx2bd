class Store {
    constructor() {
        this.renamedComponents = {};
        this.swanToRenamedComponents = {};
        this.relationComponentsParent = [];
        this.relationComponentsChild = [];
        // this.relationsFilePath = [];
    }


    dispatch({action, payload = {}}) {
        switch (action) {
            case 'renamedComponents':
                this.renamedComponents = payload;
                break;
            case 'swanToRenamedComponents':
                this.swanToRenamedComponents = payload;
                break;
            case 'relationComponentsParent':
                this.relationComponentsParent.push(payload);
                break;
            case 'relationComponentsChild':
                this.relationComponentsChild.push(payload);
                break;
            default:
                throw new Error('action未定义，行为禁止');
        }
    }
}

module.exports = new Store();
