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
      value: null,
      notify: true,
      observer: '_valueChanged',
    },

    type: {
      type: String,
      value: 'Unknown'
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

  ready () {
    this._initFocusable(this);
    this._initDroppable(this.$.dropArea);

    this._assetName = '';
  },

  _isTypeValid ( type ) {
    if ( type === this.type ) {
      return true;
    }
    return cc.isChildClassOf(
      Editor.assets[type],
      Editor.assets[this.type]
    );
  },

  _onDragOver (event) {
    let dragType = EditorUI.DragDrop.type(event.dataTransfer);
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

  _onClick ( event ) {
    event.stopPropagation();
    Editor.sendToAll('assets:hint', this.value);
  },

  _onDropAreaEnter (event) {
    event.stopPropagation();

    let dragItems = event.detail.dragItems;

    if ( this._requestID ) {
      Editor.cancelRequestToCore(this._requestID);
      this._requestID = null;
    }

    let uuid = dragItems[0];
    this.invalid = true;

    this._requestID = Editor.assetdb.queryMetaInfoByUuid(uuid, metaInfo => {
      this._requestID = null;
      this.highlighted = true;

      this._cacheUuid = uuid;
      this.invalid = !this._isTypeValid(metaInfo.assetType);
      if ( !this.invalid ) {
        return;
      }

      //
      let meta = JSON.parse(metaInfo.json);
      let keys = Object.keys(meta.subMetas);
      if ( keys.length !== 1 ) {
        return;
      }

      //
      let subMetaUuid = meta.subMetas[keys[0]].uuid;
      this._requestID = Editor.assetdb.queryInfoByUuid( subMetaUuid, info => {
        this._cacheUuid = subMetaUuid;
        this.invalid = !this._isTypeValid(info.type);
      });
    });
  },

  _onDropAreaLeave (event) {
    event.stopPropagation();

    if ( this._requestID ) {
      Editor.cancelRequestToCore(this._requestID);
      this._requestID = null;
    }

    this.highlighted = false;
    this.invalid = false;
  },

  _onDropAreaAccept (event) {
    event.stopPropagation();

    if ( this._requestID ) {
      Editor.cancelRequestToCore(this._requestID);
      this._requestID = null;
    }

    this.highlighted = false;
    this.invalid = false;

    let uuid = this._cacheUuid;
    this.set('value', uuid);
    if ( !uuid ) {
      this._assetName = 'None';
    }

    this.async(() => {
      this.fire('end-editing');
    },1);
  },

  _assetClass (value) {
    if (!value) {
      return 'null name';
    }
    return 'name';
  },

  _valueChanged () {
    if ( !this.value ) {
      this._assetName = 'None';
      return;
    }

    if ( !Editor.assetdb ) {
      this._assetName = 'Unkown';
      return;
    }

    Editor.assetdb.queryUrlByUuid( this.value, url => {
      const Url = require('fire-url');
      this._assetName = Url.basenameNoExt(url);
    });
  },

  _onBrowseClick (event) {
    event.stopPropagation();
    Editor.info('TODO');
  },
});
