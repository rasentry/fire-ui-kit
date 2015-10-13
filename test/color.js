describe('<fire-color>', function() {
    var colorEl;
    beforeEach(function ( done ) {
        fixture('widget', function ( el ) {
            colorEl = el;
            done();
        });
    });

    afterEach(function ( done ) {
        colorEl.value = new cc.Color(0,0,0,1);
        done();
    });

    it('check default value', function( done ) {
        expect(colorEl.value).to.be.eql({r:1,g:1,b:1,a:1});
        done();
    });

    it('can be set value', function( done ) {
        colorEl.value = new cc.Color(1,1,1,0.8);
        expect(colorEl.value).to.be.eql(new cc.Color(1,1,1,0.8));
        expect(colorEl.$.previewRGB.style.backgroundColor).to.be.eql('rgb(255, 255, 255)');
        expect(colorEl.$.alpha.style.width).to.be.eql('80%');
        done();
    });

    it('can be popup color-picker', function( done ) {
        Tester.click(colorEl.$.previewRGB);
        expect(colorEl._colorPicker).to.not.equal(undefined);
        done();
    });

    it('can be disabled', function( done ) {
        colorEl.disabled = true;
        expect(colorEl.hasAttribute('disabled')).to.be.eql(true);
        done();
    });
});

describe('<fire-color value="{{foo}}">', function() {
    var scopeEL;
    beforeEach(function ( done ) {
        fixture('bind-to-object', function ( el ) {
            scopeEL = el;
            done();
        });
    });

    it('shoudl bind value to foo', function(done) {
        scopeEL.foo = new cc.Color(1,0,1,1);
        expect(scopeEL.$.color.value).to.be.eql(new cc.Color(1,0,1,1));
        done();
    });

    it('shoudl work when binding value to undefined', function() {
        scopeEL.foo = undefined;
        expect(scopeEL.$.color.value).to.be.eql(undefined);
    });
});
