describe('<fire-vec2>', function() {
    var vec2El;
    beforeEach(function ( done ) {
        fixture('widget', function ( el ) {
            vec2El = el;
            done();
        });
    });

    afterEach(function ( done ) {
        vec2El.value = new cc.Vec2(0,0);
        done();
    });

    it('check default value', function( done ) {
        expect(vec2El.value).to.be.eql(new cc.Vec2(0,0));
        done();
    });

    it('can be click "up" & "down" btn', function( done ) {
        Tester.click(vec2El.$.x.getElementsByClassName('btn')[0]);
        expect(vec2El.value).to.be.eql(new cc.Vec2(1,0));
        Tester.click(vec2El.$.x.getElementsByClassName('btn')[1]);
        expect(vec2El.value).to.be.eql(new cc.Vec2(0,0));
        done();
    });

    it('can be disabled', function( done ) {
        vec2El.disabled = true;
        expect(vec2El.$.x.hasAttribute('disabled')).to.be.eql(true);
        expect(vec2El.$.y.hasAttribute('disabled')).to.be.eql(true);
        done();
    });

    it('can be set value ', function( done ) {
        vec2El.value = new cc.Vec2(77,88);
        expect(vec2El.value.x).to.be.eql(77);
        expect(vec2El.value.y).to.be.eql(88);
        done();
    });
});


describe('<fire-vec2 value="{{foo}}">', function() {
    var scopeEL;
    beforeEach(function ( done ) {
        fixture('bind-to-object', function ( el ) {
            scopeEL = el;
            done();
        });
    });

    it('shoudl bind value to foo', function(done) {
        scopeEL.foo = new cc.Vec2(99,88);
        expect(scopeEL.$.vec2.value).to.be.eql(new cc.Vec2(99,88));
        done();
    });

    it('shoudl work when binding value to undefined', function() {
        scopeEL.foo = undefined;
        expect(scopeEL.$.vec2.value).to.be.eql(undefined);
    });
});
