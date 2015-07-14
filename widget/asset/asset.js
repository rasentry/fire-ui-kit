Editor.registerWidget( 'fire-asset', {
    is: 'fire-asset',

    behaviors: [EditorUI.focusable,EditorUI.droppable],

    hostAttributes: {
        'droppable': 'asset',
        'single-drop': true,
    },

    listeners: {
        'focus': '_onFocus',
        'blur': '_onBlur',
        'click': '_onClick',
        'drop-area-enter': '_onDropAreaEnter',
        'drop-area-leave': '_onDropAreaLeave',
        'drop-area-accept': '_onDropAreaAccept',
    },

    properties: {
        value: {
            type: String,
            value: '',
            notify: true,
            observer: '_valueChanged',
        },

        type: {
            type: String,
            value: 'Unkown'
        },

        highlighted: {
            type: Boolean,
            value: false,
            reflectToAttribute: true,
        },

        invalid: {
            type: Boolean,
            value: false,
            reflectToAttribute: true,
        }
    },

    ready: function () {
        this._initFocusable(this);
        this._initDroppable(this.$.dropArea);

        this._assetName = 'Unkown';
    },

    _onDragOver: function (event) {
        var dragType = EditorUI.DragDrop.type(event.dataTransfer);
        if ( dragType !== 'asset' ) {
            EditorUI.DragDrop.allowDrop( event.dataTransfer, false );
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        //
        if ( this.highlighted ) {
            if ( !this.invalid ) {
                EditorUI.DragDrop.updateDropEffect(event.dataTransfer, 'copy');
            }
            else {
                EditorUI.DragDrop.updateDropEffect(event.dataTransfer, 'none');
            }
        }
        else {
            EditorUI.DragDrop.updateDropEffect(event.dataTransfer, 'none');
        }
    },

    _onClick: function ( event ) {
        event.stopPropagation();
        Editor.sendToWindows('editor:hint-asset', this.value);
    },

    _onDropAreaEnter: function (event) {
        event.stopPropagation();

        var dragItems = event.detail.dragItems;

        Editor.assetdb.queryInfoByUuid( dragItems[0], function ( info ) {
            this.highlighted = true;
            if ( this.type !== info['meta-type'] ) {
                this.invalid = true;
            }
        }.bind(this));
    },

    _onDropAreaLeave: function (event) {
        event.stopPropagation();

        this.highlighted = false;
        this.invalid = false;
    },

    _onDropAreaAccept: function (event) {
        event.stopPropagation();

        this.highlighted = false;
        this.invalid = false;

        var dragItems = event.detail.dragItems;
        var uuid = dragItems[0];
        this.value = uuid;
    },

    _assetClass: function (value) {
        if (!value) {
            return 'null name flex-1';
        }
        return 'name flex-1';
    },

    _valueChanged: function () {
        if ( !this.value ) {
            this._assetName = 'None';
            return;
        }

        if ( !Editor.assetdb ) {
            this._assetName = 'Unkown';
            return;
        }

        Editor.assetdb.queryInfoByUuid( this.value, function ( info ) {
            var Url = require('fire-url');
            this.type = info['meta-type'];
            this._assetName = Url.basenameNoExt(info.url);
        }.bind(this));
    },

    _onBrowseClick: function (event) {
        event.stopPropagation();
        Editor.info('TODO');
    },
});
