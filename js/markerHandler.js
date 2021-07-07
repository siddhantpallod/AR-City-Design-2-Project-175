var modelList = []
var models = []

AFRAME.registerComponent('marker-handler', {
    init: async function () {
        this.el.addEventListener('markerFound', () => {
            var modelName = this.el.getAttribute('model_name')
            var barcodeValue = this.el.getAttribute('value')
            modelList.push({
                model_name: modelName,
                barcode_value: barcodeValue
            })
            this.el.setAttribute('visible', true)
        })

        this.el.addEventListener('markerLost', () => {
            var modelName = this.el.getAttribute('model_name')
            var index = modelList.findIndex(x => x.model_name === modelName)

            if(index > -1){
                modelList.splice(index, 1)
            }
        })
    },

    isModelPresentInArray: function(arr, val){
        for(var i of arr){
            if(i.model_name === val){
                return true
            }
        }
        return false
    },

    getDistance: function(elA, elB){
        return elA.object3D.position.distanceTo(elB.object3D.position)
    },

    tick: async function(){
        if(modelList.length > 1){
            var isBaseModelPresent = this.isModelPresentInArray(modelList, 'base')
            var messageText = document.querySelector('#message-text')

            if(!isBaseModelPresent){
                messageText.setAttribute('visible', true)
            }
            else{
                if(models === null){
                    models = await this.getModels()
                }

                messageText.setAttribute('visible', false)
                this.placeModel('road', models)
                this.placeModel('car', models)
                this.placeModel('building1', models)
                this.placeModel('building2', models)
                this.placeModel('building3', models)
                this.placeModel('tree', models)
                this.placeModel('sun', models)
            }
        }
    },

    getModels: function(){
        return fetch("js/models.json").then(res => res.json()).then(data => data)
    },

    getModelGeometry: function(models, modelName){
        var barcodes = Object.keys(models)

        for(var barcode of barcodes){
            if(models[barcode].model_name === modelName){
                return{
                position: models[barcode]['placement_position'],
                rotation: models[barcode]['placement_rotation'],
                scale: models[barcode]['placement_scale'],
                model_url: models[barcode]['model_url']
                }
            }
        }
    },

    placeModel: function(modelName, models){
        var isListContainModel = this.isModelPresentInArray(modelList, modelName)

        if(isListContainModel){
            var distance = null;
            var marker1 = document.querySelector('#marker-base')
            var marker2 = document.querySelector(`marker-${modelName}`)

            distance = this.getDistance(marker1, marker2)
            if(distance < 1.25){
                var model = document.querySelector(`#${modelName}`)
                model.setAttribute('visible', false)

                var isModelPlaced = document.querySelector(`#model-${modelName}`)
                if(isModelPlaced === null){
                    var element = document.createElement('a-entity')
                    var modelGeometry = this.getModelGeometry(models, modelName)
                    element.setAttribute('id', `model-${modelName}`)
                    element.setAttribute('gltf-model', `url(${modelGeometry.model_url})`)
                    element.setAttribute('position', modelGeometry.position)
                    element.setAttribute('rotation', modelGeometry.rotation)
                    element.setAttribute('scale', modelGeometry.scale)
                    marker1.appendChild(element)
                }
            }
        }
    }
});
