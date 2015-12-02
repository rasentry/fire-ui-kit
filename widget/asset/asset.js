'use strict';

Editor.registerElement({
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
            value: undefined,
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

        this._assetName = '';
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
                EditorUI.DragDrop.allowDrop( event.dataTransfer, true );
            }
            else {
                EditorUI.DragDrop.updateDropEffect(event.dataTransfer, 'none');
                EditorUI.DragDrop.allowDrop( event.dataTransfer, false );
            }
        }
        else {
            EditorUI.DragDrop.updateDropEffect(event.dataTransfer, 'none');
            EditorUI.DragDrop.allowDrop( event.dataTransfer, false );
        }
    },

    _onClick: function ( event ) {
        event.stopPropagation();
        Editor.sendToAll('assets:hint', this.value);
    },

    _onDropAreaEnter: function (event) {
        event.stopPropagation();

        var dragItems = event.detail.dragItems;

        if ( this._requestID ) {
            Editor.cancelRequestToCore(this._requestID);
            this._requestID = null;
        }

        this._requestID = Editor.assetdb.queryInfoByUuid( dragItems[0], info => {
            this._requestID = null;
            this.highlighted = true;
            this.invalid = true;

            if ( info.type === this.type ) {
                this.invalid = false;
            } else {
                this.invalid = cc.isChildClassOf(
                    cc.js._getClassId(Editor.assets[info.type]),
                    cc.js._getClassId(Editor.assets[this.type])
                );
            }
        });
    },

    _onDropAreaLeave: function (event) {
        event.stopPropagation();

        if ( this._requestID ) {
            Editor.cancelRequestToCore(this._requestID);
            this._requestID = null;
        }

        this.highlighted = false;
        this.invalid = false;
    },

    _onDropAreaAccept: function (event) {
        event.stopPropagation();

        if ( this._requestID ) {
            Editor.cancelRequestToCore(this._requestID);
            this._requestID = null;
        }

        this.highlighted = false;
        this.invalid = false;

        var dragItems = event.detail.dragItems;
        var uuid = dragItems[0];
        this.set('value', uuid);

        this.async(() => {
          this.fire('end-editing');
        },1);
    },

    _assetClass: function (value) {
        if (!value) {
            return 'null name';
        }
        return 'name';
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

        Editor.assetdb.queryUrlByUuid( this.value, function ( url ) {
            var Url = require('fire-url');
            this._assetName = Url.basenameNoExt(url);
        }.bind(this));
    },

    _onBrowseClick: function (event) {
        event.stopPropagation();
        Editor.info('TODO');
    },
});
